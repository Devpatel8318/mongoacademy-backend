import { Context, isEqual } from 'deps'
import config from 'config'
import { successObject } from 'utils/responseObject'
import getMd5Hash from 'utils/getMd5Hash'
import { getDataFromRedis } from 'redisQueries'
import pushMessageInSqs from 'utils/aws/SQS/pushMessageInSqs'
import * as statusQueries from 'queries/status'
import * as submissionQueries from 'queries/submission'

export const submitAnswer = async (ctx: Context) => {
	const { email, userId } = ctx.state.shared.user
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
		submissionId,
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
			StringValue: email,
		},
		senderId: { DataType: 'Number', StringValue: userId },
	}
	const sqsMessage = {
		socketId,
		submissionId,
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

export const runAnswer = async (ctx: Context) => {
	const { email, userId } = ctx.state.shared.user
	const { questionId } = ctx.state.shared.question
	const answer = ctx.state.shared.answer

	const {
		answerQuery,
		collection,
		queryType,
		queryFilter,
		chainedOps,
		socketId,
		submissionId,
	} = answer

	const A_HASH = getMd5Hash(answerQuery)

	const cachedAnswerResponse = A_HASH && (await getDataFromRedis(A_HASH))

	if (cachedAnswerResponse) {
		ctx.body = successObject('', {
			questionId,
			output: cachedAnswerResponse,
		})
		return
	}

	const dbName = 'db'
	const sqsUrl = config.aws.sqs.restToQueryProcessorQueue
	const messageAttribute = {
		senderEmail: {
			DataType: 'String',
			StringValue: email,
		},
		senderId: { DataType: 'Number', StringValue: userId },
		isRunOnly: {
			DataType: 'String',
			StringValue: 'true',
		},
	}
	const sqsMessage = {
		socketId,
		submissionId,
	}

	Object.assign(sqsMessage, {
		question: {
			isRunOnly: true,
			questionId,
			// * to keep lambda functions clean, pass the question as cached, so that lambda do not run query on question.
			isResponseCached: true,
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

	console.dir({ sqsMessage }, { depth: null })

	await pushMessageInSqs(sqsUrl, sqsMessage, messageAttribute)

	ctx.status = 202
	ctx.body = successObject('Your Submission is being processed', {
		questionId,
		pending: true,
	})
}

export const evaluateAnswer = async (ctx: Context) => {
	const { submissionId } = ctx.state.shared
	const { userId } = ctx.state.shared.user
	const { questionId } = ctx.state.shared.question
	const { question: questionRedisKey, answer: answerRedisKey } = ctx.request
		.body as {
		question: string
		answer: string
	}

	const [questionResponse, answerResponse] = await Promise.allSettled([
		getDataFromRedis(questionRedisKey),
		getDataFromRedis(answerRedisKey),
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
		ctx.throw('Something went wrong')
	}

	if (isEqual(response.question, response.answer)) {
		await statusQueries.updateOneStatus(
			{ userId, questionId },
			{
				$set: {
					status: 3,
				},
			}
		)

		await submissionQueries.updateOneSubmission(
			{ submissionId },
			{
				$set: {
					status: 'CORRECT',
				},
			}
		)

		ctx.body = successObject('Correct Answer', {
			questionId,
			correct: true,
			expected: response.question,
			output: response.answer,
		})
	} else {
		await submissionQueries.updateOneSubmission(
			{ submissionId },
			{
				$set: {
					status: 'INCORRECT',
				},
			}
		)

		ctx.body = successObject('Wrong Answer', {
			questionId,
			correct: false,
			expected: response.question,
			output: response.answer,
		})
	}
}

export const submissionList = async (ctx: Context) => {
	const { questionId } = ctx.state.shared.question
	const { userId } = ctx.state.shared.user

	const submissionList = await submissionQueries.fetchSubmissions(
		{
			userId,
			questionId: +questionId,
		},
		{
			_id: 0,
		}
	)

	// const submissionList = await MongoDB.collection('submission')
	// 	.find({
	// 		userId,
	// 		questionId: +questionId,
	// 	})
	// 	.toArray()

	ctx.body = successObject('Submission List', {
		questionId,
		list: submissionList,
	})
}

export const runOnlyRetrieveData = async (ctx: Context) => {
	const { questionId } = ctx.state.shared.question
	const { answer: answerRedisKey } = ctx.request.body as { answer: string }

	const answerResponse = await getDataFromRedis(answerRedisKey)

	if (answerResponse) {
		ctx.body = successObject('', {
			questionId,
			output: answerResponse,
			isRunOnly: true,
		})
	} else {
		ctx.throw('something went wrong')
	}
}
