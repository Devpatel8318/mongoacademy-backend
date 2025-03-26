import config from 'config'
import { Context, isEqual, Sort } from 'deps'

import mongoDB from '../../../MongoDb/connection'
import * as questionQueries from 'queries/questions'

import { successObject } from 'utils/responseObject'
import { getDataFromRedis, setDataInRedis } from 'utils/redis/redis'

export const checkAnswer = async (ctx: Context) => {
	const checkExecutionTime = config.common.checkExecutionTime

	const { collection: questionCollection, filter: questionFilter } =
		ctx.state.shared.question

	const { collection: answerCollection, queryFilter: answerFilter } =
		ctx.state.shared.answer

	const correctAnswer =
		(await mongoDB
			.collection(questionCollection)
			.findOne(questionFilter)) ?? {}

	const usersQueryResult =
		(await mongoDB.collection(answerCollection).findOne(answerFilter)) ?? {}

	const isAnswerCorrect = isEqual(correctAnswer, usersQueryResult)

	if (!isAnswerCorrect) {
		const failureResponse = {
			correct: false,
			result: usersQueryResult,
		}
		ctx.body = successObject('Wrong Answer', failureResponse)
		return
	}

	const successResponse = {
		correct: true,
		result: usersQueryResult,
	}

	if (checkExecutionTime) {
		const result = await mongoDB.command({
			explain: {
				find: answerCollection,
				filter: answerFilter,
			},
			verbosity: 'executionStats',
		})

		Object.assign(successResponse, {
			executionTime: result.executionStats.executionTimeMillis,
		})
	}

	ctx.body = successObject('Correct Answer', successResponse)
}

// export const getSolution = async (ctx) => {
//     const { questionId } = ctx.request.body;

//     const response = questionQueries.getAllQuestions(
//         { questionId },
//         { _id: 0 }
//     );

//     ctx.body = successObject('', response);
// };

// export const submitAnswer = async (ctx) => {
//     const { questionId, input } = ctx.request.body;

//     const isAnswerCorrectResponse = await isAnswerCorrect(questionId, input);

//     ctx.body = isAnswerCorrectResponse
//         ? successObject('Correct Answer')
//         : failureObject(
//               'Submitted answer did not got expected output',
//               'Wrong Answer'
//           );
// };

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

export const userSetting = async (ctx: Context) => {
	const user = ctx.state.shared.user

	ctx.body = successObject('', user)
}
