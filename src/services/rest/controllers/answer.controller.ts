import { Context, isEqual, Sort } from 'deps'
import config from 'config'
import { successObject } from 'utils/responseObject'
import * as questionQueries from 'queries/questions'
import getMd5Hash from 'utils/getMd5Hash'
import { getDataFromRedis, setDataInRedis } from 'utils/redis/redis'
import pushMessageInSqs from 'utils/aws/SQS/pushMessageInSqs'

interface GetAllQuestionsQueryParams {
	limit?: string
	page?: string
	status?: string
	difficulty?: string
	sortBy?: string
	sortOrder?: string
	search?: string
}

export const getAllQuestions = async (ctx: Context) => {
	const {
		limit = '20',
		page = '1',
		status = '',
		difficulty = '',
		sortBy = '_id',
		sortOrder = 'DESC',
		search = '',
	}: GetAllQuestionsQueryParams = ctx.query

	const limitNum = Number(limit)
	const pageNum = Number(page)
	const sortOrderNum = sortOrder === 'ASC' ? 1 : -1

	const filters: Record<string, any> = {}

	if (search) {
		filters.question = { $regex: search, $options: 'i' }
	}

	if (status) {
		filters.status = {
			$in: status.split(',').map((s) => s.toUpperCase()),
		}
	}

	if (difficulty) {
		filters.difficulty = {
			$in: difficulty.split(',').map((d) => {
				if (!isNaN(Number(d))) return Number(d)
				switch (d.toUpperCase()) {
					case 'EASY':
						return 1
					case 'MEDIUM':
						return 5
					case 'HARD':
						return 10
					default:
						return 1
				}
			}),
		}
	}

	const sort: Sort = { [sortBy]: sortOrderNum }

	const skip = (pageNum - 1) * limitNum

	const redisKey = `filter=${JSON.stringify(filters)}:sort=${JSON.stringify(
		sort
	)}:page=${skip}-${limitNum}`

	const redisData = await getDataFromRedis(redisKey)

	if (redisData) {
		ctx.body = successObject('', redisData)
		return
	}

	const response = await questionQueries.getAllQuestionsAndCount({
		filter: filters,
		sort,
		skip,
		limit: limitNum,
		projection: {
			question: 1,
			status: 1,
			difficulty: 1,
			questionId: 1,
		},
	})

	const { data, totalCount } = response[0] || {}
	const responseObject = {
		list: data,
		total: totalCount?.[0]?.total || 0,
	}

	await setDataInRedis(redisKey, responseObject, 60 * 60)

	ctx.body = successObject('', responseObject)
}

export const getSolution = async (ctx: Context) => {
	const { questionId } = ctx.request.body as { questionId: number }

	const response = questionQueries.getAllQuestions({
		filter: { questionId },
		projection: { _id: 0 },
	})

	ctx.body = successObject('', response)
}

export const submitAnswer = async (ctx: Context) => {
	console.log(ctx.state.shared.question)
	const {
		questionId,
		answer: correctQuery,
		collection: correctCollection,
		queryType: correctQueryType,
		queryFilter: correctQueryFilter,
	} = ctx.state.shared.question

	const answer = ctx.state.shared.answer

	const { answerQuery, collection, queryType, queryFilter } = answer

	const Q_HASH = getMd5Hash(correctQuery)
	const A_HASH = getMd5Hash(answerQuery)

	// small optimization if hash are equal means both will give same result
	// if (Q_HASH === A_HASH) {
	// 	ctx.body = 'Correct Answer'
	// 	return
	// }

	const cachedQuestionResponse = Q_HASH && (await getDataFromRedis(Q_HASH))
	const cachedAnswerResponse = A_HASH && (await getDataFromRedis(A_HASH))

	const dbName = 'db'
	const sqsUrl = config.aws.sqs.restToQueryProcessorQueue
	const messageAttribute = {
		senderEmail: {
			DataType: 'String',
			StringValue: 'dev@example.com',
		},
		senderId: { DataType: 'Number', StringValue: '6548' },
	}
	const sqsMessage = {}

	if (cachedAnswerResponse && cachedQuestionResponse) {
		if (isEqual(cachedQuestionResponse, cachedAnswerResponse)) {
			ctx.body = successObject('Correct Answer')
			return
		}
	} else if (!cachedAnswerResponse && cachedQuestionResponse) {
		Object.assign(sqsMessage, {
			question: {
				isResponseCached: true,
				questionId: questionId,
				redisKey: Q_HASH,
			},
			answer: {
				isResponseCached: false,
				/***
				 * * adding RedisKey to make it easier to set data in redis after processing
				 */
				redisKey: A_HASH,
				data: {
					dbName,
					collection,
					queryType,
					queryFilter,
					answerQuery: answerQuery,
				},
			},
		})
	} else if (cachedAnswerResponse && !cachedQuestionResponse) {
		Object.assign(sqsMessage, {
			question: {
				isResponseCached: false,
				questionId: questionId,
				redisKey: Q_HASH,
				data: {
					dbName,
					collection: correctCollection,
					queryType: correctQueryType,
					queryFilter: correctQueryFilter,
					questionQuery: correctQuery,
				},
			},
			answer: {
				isResponseCached: true,
				redisKey: Q_HASH,
			},
		})
	} else if (!cachedAnswerResponse && !cachedQuestionResponse) {
		Object.assign(sqsMessage, {
			question: {
				isResponseCached: false,
				questionId: questionId,
				redisKey: Q_HASH,
				data: {
					dbName,
					collection: correctCollection,
					queryType: correctQueryType,
					queryFilter: correctQueryFilter,
					questionQuery: correctQuery,
				},
			},
			answer: {
				isResponseCached: false,
				redisKey: A_HASH,
				data: {
					dbName,
					collection,
					queryType,
					queryFilter,
					answerQuery: answerQuery,
				},
			},
		})
	}

	console.dir({ sqsMessage }, { depth: null })

	await pushMessageInSqs(sqsUrl, sqsMessage, messageAttribute)

	ctx.status = 202
	ctx.body = successObject('Your Submission is being processed')
}

export const evaluateAnswer = async (ctx: Context) => {
	const { questionId } = ctx.state.shared.question
	const { question, answer } = ctx.request.body as {
		question: string
		answer: string
	}

	const [questionResponse, answerResponse] = await Promise.allSettled([
		getDataFromRedis(question),
		getDataFromRedis(answer),
	])

	let response: { question?: any; answer?: any } = {}

	if (
		questionResponse.status === 'fulfilled' &&
		answerResponse.status === 'fulfilled'
	) {
		response = {
			question: questionResponse.value,
			answer: answerResponse.value,
		}
	} else {
		throw new Error('Something went wrong')
	}

	if (isEqual(response.question, response.answer)) {
		ctx.body = successObject('Correct Answer', {
			questionId,
			correct: true,
			result: response.answer,
		})
	} else {
		ctx.body = successObject('Wrong Answer', {
			questionId,
			correct: false,
			result: response.answer,
		})
	}
}
