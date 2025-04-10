import {
	// Collection, Document, isEqual,
	Router,
} from 'deps'
// import config from 'config'

// import pushMessageInSqs from 'utils/aws/SQS/pushMessageInSqs'

// import validator from '../middlewares/validator'

// import {
// 	doesQueryDataExist,
// 	isAnswerFieldsValid,
// 	isCollectionValid,
// 	isDbNameValid,
// 	isNumberOfDotsValid,
// 	isQueryFilterValid,
// 	isQueryTypeValid,
// 	isQuestionIdValid,
// } from '../validators/userValidators'

import {
	// checkAnswer,
	// getAllQuestions,
	userSetting,
} from '../controllers/user.controller'
// import { getDataFromRedis } from 'utils/redis/redis'
// import getMd5Hash from 'utils/getMd5Hash'
// import mongoDb from '../../../MongoDb/connection'
import auth from 'services/rest/middlewares/auth'

// import auth from '../middlewares/auth'

const router = new Router({ prefix: '/user' })

router.get('/setting', auth, userSetting)

// router.get('/list', auth, getAllQuestions)

router.get('/test/:id', (ctx) => {
	console.log(ctx.params.id)
	console.log(ctx.query.df)
	ctx.body = `Hello World ${ctx.params.id}`
})

// router.post(
// 	'/answer/:questionId',
// 	validator([
// 		isQuestionIdValid,
// 		isAnswerFieldsValid,
// 		doesQueryDataExist,
// 		isNumberOfDotsValid,
// 		isDbNameValid,
// 		isCollectionValid,
// 		isQueryTypeValid,
// 		isQueryFilterValid,
// 	]),
// 	checkAnswer
// )

/*
i now have way to validate
-> find's (filter and projection)
-> sort
-> skip
-> limit
-> whole aggregiation pipeline can be parsed

Challenges:
-> validate db name
-> validate collection name
-> validate queryType
-> user might do find then use project()
*/

// router.post(
// 	'/test',
// 	validator([
// 		// isQuestionIdValid,
// 		// isAnswerFieldsValid,
// 		// doesQueryDataExist,
// 		// isNumberOfDotsValid,
// 		// isDbNameValid,
// 		// isCollectionValid,
// 		// isQueryTypeValid,
// 		// isQueryFilterValid,
// 	]),
// 	(ctx) => {
// 		pushMessageInSqs(config.aws.sqs.restToQueryProcessorQueue, {
// 			hello: 'world',
// 		}, {
// 			sentBy: { DataType: 'String', StringValue: 'Dev Patel' },
// 		})
// 		ctx.body = `Hello World`
// 	},
// )

// router.post('/test2', (ctx) => {
// 	pushMessageInSqs(
// 		config.aws.sqs.restToQueryProcessorQueue,
// 		{
// 			question: {
// 				isResponseCached: true,
// 				redisKey: 'wsdfgtyujkl',
// 			},
// 			answer: {
// 				isResponseCached: false,
// 				collectionName: 'posts',
// 				query: { title: 'Post 202' },
// 				questionId: '123123',
// 			},
// 		},
// 		{
// 			senderEmail: { DataType: 'String', StringValue: 'dev@example.com' },
// 			senderId: { DataType: 'Number', StringValue: '6548' },
// 		}
// 	)
// 	ctx.body = `Hello World`
// })

// router.post('/retrieve', async (ctx) => {
// 	const { question, answer } = ctx.request.body as {
// 		question: string
// 		answer: string
// 	}

// 	const [questionResponse, answerResponse] = await Promise.allSettled([
// 		getDataFromRedis(question),
// 		getDataFromRedis(answer),
// 	])

// 	let response: { question?: any; answer?: any } = {}

// 	if (
// 		questionResponse.status === 'fulfilled' &&
// 		answerResponse.status === 'fulfilled'
// 	) {
// 		response = {
// 			question: questionResponse.value,
// 			answer: answerResponse.value,
// 		}
// 	} else {
// 		throw new Error('Something went wrong')
// 	}

// 	if (isEqual(response.question, response.answer)) {
// 		ctx.body = 'Correct Answer'
// 	} else {
// 		ctx.body = 'Incorrect Answer'
// 	}
// })

// router.post('/test3', async (ctx) => {
// 	const answer = {
// 		isResponseCached: false,
// 		data: {
// 			dbName: 'db',
// 			collection: 'posts',
// 			queryType: 'findOne',
// 			queryFilter: { post: 302 },
// 		},
// 	}

// 	const mongoCollection: Collection = mongoDb.collection(
// 		answer.data.collection
// 	)

// 	const queryType = answer.data.queryType as keyof Collection<Document>

// 	const result = await (mongoCollection[queryType] as Function)(
// 		answer.data.queryFilter
// 	)

// 	console.log(result)

// 	ctx.body = 'Incorrect Answer'
// })

// router.post(
// 	'/test/:questionId/QA',
// 	validator([
// 		isQuestionIdValid,
// 		isAnswerFieldsValid,
// 		doesQueryDataExist,
// 		isNumberOfDotsValid,
// 		isDbNameValid,
// 		isCollectionValid,
// 		isQueryTypeValid,
// 		isQueryFilterValid,
// 	]),
// 	async (ctx) => {
// 		const questionQueryData = ctx.state.shared.question.answer
// 		const answer = ctx.state.shared.answer
// 		const {
// 			queryData: answerQueryData,
// 			dbName,
// 			collection,
// 			queryType,
// 			queryFilter,
// 		} = answer

// 		const Q_HASH = getMd5Hash(questionQueryData)
// 		const A_HASH = getMd5Hash(answerQueryData)

// 		// small optimization if hash are equal means both will give same result
// 		// if (Q_HASH === A_HASH) {
// 		// 	ctx.body = 'Correct Answer'
// 		// 	return
// 		// }

// 		const cachedQuestionResponse =
// 			Q_HASH && (await getDataFromRedis(Q_HASH))
// 		const cachedAnswerResponse = A_HASH && (await getDataFromRedis(A_HASH))

// 		console.log({ cachedQuestionResponse, cachedAnswerResponse })

// 		if (cachedAnswerResponse && cachedQuestionResponse) {
// 			if (isEqual(cachedQuestionResponse, cachedAnswerResponse)) {
// 				return
// 			}
// 		} else if (!cachedAnswerResponse && cachedQuestionResponse) {
// 			pushMessageInSqs(
// 				config.aws.sqs.restToQueryProcessorQueue,
// 				{
// 					question: {
// 						isResponseCached: true,
// 						questionId: 'questionId',
// 						redisKey: Q_HASH,
// 					},
// 					answer: {
// 						isResponseCached: false,
// 						/***
// 						 * * adding RedisKey to make it easier to set data in redis after processing
// 						 */
// 						redisKey: A_HASH,
// 						data: {
// 							dbName,
// 							collection,
// 							queryType,
// 							queryFilter,
// 							queryData: answerQueryData,
// 						},
// 					},
// 				},
// 				{
// 					senderEmail: {
// 						DataType: 'String',
// 						StringValue: 'dev@example.com',
// 					},
// 					senderId: { DataType: 'Number', StringValue: '6548' },
// 				}
// 			)
// 		} else if (cachedAnswerResponse && !cachedQuestionResponse) {
// 			pushMessageInSqs(
// 				config.aws.sqs.restToQueryProcessorQueue,
// 				{
// 					question: {
// 						isResponseCached: false,
// 						questionId: 'questionId',
// 						redisKey: Q_HASH,
// 						data: {
// 							dbName,
// 							collection,
// 							queryType,
// 							queryFilter,
// 							queryData: answerQueryData,
// 						},
// 					},
// 					answer: {
// 						isResponseCached: true,
// 						redisKey: Q_HASH,
// 					},
// 				},
// 				{
// 					senderEmail: {
// 						DataType: 'String',
// 						StringValue: 'dev@example.com',
// 					},
// 					senderId: { DataType: 'Number', StringValue: '6548' },
// 				}
// 			)
// 		} else if (!cachedAnswerResponse && !cachedQuestionResponse) {
// 			pushMessageInSqs(
// 				config.aws.sqs.restToQueryProcessorQueue,
// 				{
// 					question: {
// 						isResponseCached: false,
// 						questionId: 'questionId',
// 						redisKey: Q_HASH,
// 						data: {
// 							dbName,
// 							collection,
// 							queryType,
// 							queryFilter,
// 							queryData: answerQueryData,
// 						},
// 					},
// 					answer: {
// 						isResponseCached: false,
// 						redisKey: A_HASH,
// 						data: {
// 							dbName,
// 							collection,
// 							queryType,
// 							queryFilter,
// 							queryData: answerQueryData,
// 						},
// 					},
// 				},
// 				{
// 					senderEmail: {
// 						DataType: 'String',
// 						StringValue: 'dev@example.com',
// 					},
// 					senderId: { DataType: 'Number', StringValue: '6548' },
// 				}
// 			)
// 		}

// 		ctx.body = 'Incorrect Answer'
// 	}
// )

export default router
