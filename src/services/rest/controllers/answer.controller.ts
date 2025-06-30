import { Context, isEqual } from 'deps'
import config from 'config'
import { successObject } from 'utils/responseObject'
import getMd5Hash from 'utils/getMd5Hash'
import { CACHE_NULL_MARKER, getDataFromRedis } from 'redisQueries'
import pushMessageInSqs from 'utils/aws/SQS/pushMessageInSqs'
import * as questionQueries from 'queries/questionProgress'
import * as submissionQueries from 'queries/submission'
import { QuestionProgressEnum, SubmissionStatusEnum } from 'Types/enums'
import { logToCloudWatch } from 'utils/aws/cloudWatch/logToCloudWatch'

const getCachedValue = async (hash: string) => {
	let value = await getDataFromRedis(hash)
	const isCached = value !== null

	if (value === CACHE_NULL_MARKER) {
		value = null
	}

	return { value, isCached }
}

export const submitAnswer = async (ctx: Context) => {
	const { email, userId } = ctx.state.shared.user
	const {
		questionId,
		correctQuery,
		correctCollection,
		correctQueryType,
		correctQueryFilter,
		correctChainedOps,
		correctQueryUpdate,
		correctQueryOptions,
	} = ctx.state.shared.question

	const answer = ctx.state.shared.answer

	const {
		answerQuery,
		collection,
		queryType,
		queryFilter,
		queryUpdate,
		queryOptions,
		chainedOps,
		socketId,
		submissionId,
	} = answer

	const correctQueryKeyObject = {
		collection: correctCollection,
		queryType: correctQueryType,
		queryFilter: correctQueryFilter,
		chainedOps: correctChainedOps,
		queryUpdate: correctQueryUpdate,
		queryOptions: correctQueryOptions,
	}
	const correctQueryKeyString = JSON.stringify(correctQueryKeyObject)

	const answerQueryKeyObject = {
		collection,
		queryType,
		queryFilter,
		chainedOps,
		queryUpdate,
		queryOptions,
	}
	const answerQueryKeyString = JSON.stringify(answerQueryKeyObject)

	const Q_HASH = getMd5Hash(correctQueryKeyString)
	const A_HASH = getMd5Hash(answerQueryKeyString)

	// TODO: complete this optimization
	// small optimization if hash are equal means both will give same result
	// if (Q_HASH === A_HASH) {
	// 	ctx.body = 'Correct Answer'
	// 	return
	// }

	const {
		value: cachedQuestionResponse,
		isCached: isQuestionResponseCached,
	} = await getCachedValue(Q_HASH)

	const { value: cachedAnswerResponse, isCached: isAnswerResponseCached } =
		await getCachedValue(A_HASH)

	const dbName = 'db'
	const sqsUrl = config.aws.sqs.restToQueryProcessorQueue
	const messageAttribute = {
		senderEmail: {
			DataType: 'String',
			StringValue: email,
		},
		senderId: { DataType: 'Number', StringValue: `${userId}` },
	}

	if (isAnswerResponseCached && isQuestionResponseCached) {
		const correct = isEqual(cachedQuestionResponse, cachedAnswerResponse)

		if (correct) {
			await questionQueries.updateOneQuestionProgress(
				{ userId, questionId },
				{
					$set: {
						progress: QuestionProgressEnum.SOLVED,
						updatedAt: new Date(),
					},
				}
			)
		}

		await submissionQueries.updateOneSubmission(
			{ submissionId: answer.submissionId },
			{
				$set: {
					submissionStatus: correct
						? SubmissionStatusEnum.CORRECT
						: SubmissionStatusEnum.INCORRECT,
					updatedAt: new Date(),
				},
			}
		)

		ctx.body = successObject(correct ? 'Correct Answer' : 'Wrong Answer', {
			questionId,
			correct,
			expected: cachedQuestionResponse,
			output: cachedAnswerResponse,
		})
		return
	}

	const questionData = isQuestionResponseCached
		? { isResponseCached: true, questionId, redisKey: Q_HASH }
		: {
				isResponseCached: false,
				questionId: questionId,
				redisKey: Q_HASH,
				data: {
					dbName,
					collection: correctCollection,
					queryType: correctQueryType,
					queryFilter: correctQueryFilter,
					queryUpdate: correctQueryUpdate,
					queryOptions: correctQueryOptions,
					questionQuery: correctQuery,
					chainedOps: correctChainedOps,
				},
			}

	const answerData = isAnswerResponseCached
		? { isResponseCached: true, redisKey: A_HASH }
		: {
				isResponseCached: false,
				redisKey: A_HASH,
				data: {
					dbName,
					collection,
					queryType,
					queryFilter,
					queryUpdate,
					queryOptions,
					answerQuery,
					chainedOps,
				},
			}

	const sqsMessage = {
		socketId,
		submissionId,
		question: questionData,
		answer: answerData,
	}

	console.dir({ sqsMessage, messageAttribute }, { depth: null })

	await pushMessageInSqs(sqsUrl, sqsMessage, messageAttribute)
	await logToCloudWatch({
		group: 'BACKEND',
		stream: 'REST',
		data: {
			message: 'pushed message in SQS to lambda from REST server',
			sqsMessage,
			messageAttribute,
			userId,
			questionId,
			submissionId,
			socketId,
		},
	})

	ctx.status = 202
	ctx.body = successObject('Your Submission is being processed', {
		questionId,
		submissionId,
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
		queryUpdate,
		queryOptions,
		chainedOps,
		socketId,
		submissionId,
	} = answer

	const answerQueryKeyObject = {
		collection,
		queryType,
		queryFilter,
		chainedOps,
		queryUpdate,
		queryOptions,
	}
	const answerQueryKeyString = JSON.stringify(answerQueryKeyObject)

	const A_HASH = getMd5Hash(answerQueryKeyString)

	const { value: cachedAnswerResponse, isCached: isAnswerResponseCached } =
		await getCachedValue(A_HASH)

	if (isAnswerResponseCached) {
		ctx.body = successObject('', {
			questionId,
			output: cachedAnswerResponse,
			isRunOnly: true,
		})
		return
	}

	const messageAttribute = {
		senderEmail: { DataType: 'String', StringValue: email },
		senderId: { DataType: 'Number', StringValue: `${userId}` },
		isRunOnly: { DataType: 'String', StringValue: 'true' },
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
				dbName: 'db',
				collection,
				queryType,
				queryFilter,
				queryUpdate,
				queryOptions,
				answerQuery,
				chainedOps,
			},
		},
	})

	const sqsUrl = config.aws.sqs.restToQueryProcessorQueue
	await pushMessageInSqs(sqsUrl, sqsMessage, messageAttribute)
	await logToCloudWatch({
		group: 'BACKEND',
		stream: 'REST',
		data: {
			message: 'pushed message in SQS to lambda from REST server',
			sqsMessage,
			messageAttribute,
			userId,
			questionId,
			submissionId,
			socketId,
		},
	})

	ctx.status = 202
	ctx.body = successObject('Your Submission is being processed', {
		questionId,
		submissionId,
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

	const { value: questionResponse } = await getCachedValue(questionRedisKey)
	const { value: answerResponse } = await getCachedValue(answerRedisKey)

	const correct = isEqual(questionResponse, answerResponse)

	if (correct) {
		await questionQueries.updateOneQuestionProgress(
			{ userId, questionId },
			{
				$set: {
					progress: QuestionProgressEnum.SOLVED,
					updatedAt: new Date(),
				},
			}
		)
	}

	await submissionQueries.updateOneSubmission(
		{ submissionId },
		{
			$set: {
				submissionStatus: correct
					? SubmissionStatusEnum.CORRECT
					: SubmissionStatusEnum.INCORRECT,
				updatedAt: new Date(),
			},
		}
	)

	ctx.body = successObject(correct ? 'Correct Answer' : 'Wrong Answer', {
		questionId,
		correct,
		expected: questionResponse,
		output: answerResponse,
	})
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

	ctx.body = successObject('Submission List', {
		questionId,
		list: submissionList,
	})
}

export const runOnlyRetrieveData = async (ctx: Context) => {
	const { questionId } = ctx.state.shared.question
	const { answer: answerRedisKey } = ctx.request.body as { answer: string }

	const { value: answerResponse } = await getCachedValue(answerRedisKey)

	if (answerResponse !== undefined) {
		ctx.body = successObject('', {
			questionId,
			output: answerResponse,
			isRunOnly: true,
		})
	} else {
		console.log('answerResponse not found in redis')
		ctx.throw('something went wrong')
	}
}
