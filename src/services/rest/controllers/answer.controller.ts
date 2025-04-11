import { Context, isEqual } from 'deps'
import config from 'config'
import { successObject } from 'utils/responseObject'
import getMd5Hash from 'utils/getMd5Hash'
import { getDataFromRedis } from 'utils/redis/redis'
import pushMessageInSqs from 'utils/aws/SQS/pushMessageInSqs'

export const submitAnswer = async (ctx: Context) => {
	const {
		questionId,
		answer: correctQuery,
		collection: correctCollection,
		queryType: correctQueryType,
		queryFilter: correctQueryFilter,
		chainedOps: correctChainedOps,
	} = ctx.state.shared.question

	const answer = ctx.state.shared.answer

	const {
		answerQuery,
		collection,
		queryType,
		queryFilter,
		chainedOps,
		socketId,
	} = answer

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
	const sqsMessage = {
		socketId,
	}

	if (cachedAnswerResponse && cachedQuestionResponse) {
		if (isEqual(cachedQuestionResponse, cachedAnswerResponse)) {
			ctx.body = successObject('Correct Answer', {
				questionId,
				correct: true,
				expected: cachedQuestionResponse,
				output: cachedAnswerResponse,
			})
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
					chainedOps,
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
					chainedOps: correctChainedOps,
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
					chainedOps: correctChainedOps,
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
					chainedOps,
				},
			},
		})
	}

	console.dir({ sqsMessage }, { depth: null })

	await pushMessageInSqs(sqsUrl, sqsMessage, messageAttribute)

	ctx.status = 202
	ctx.body = successObject('Your Submission is being processed', {
		questionId,
		pending: true,
	})
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
			expected: response.question,
			output: response.answer,
		})
	} else {
		ctx.body = successObject('Wrong Answer', {
			questionId,
			correct: false,
			expected: response.question,
			output: response.answer,
		})
	}
}
