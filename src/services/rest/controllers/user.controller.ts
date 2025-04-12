import config from 'config'
import { Context, isEqual } from 'deps'

import mongoDB from '../../../MongoDb/connection'

import { successObject } from 'utils/responseObject'

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

export const userSetting = async (ctx: Context) => {
	const user = ctx.state.shared.user

	ctx.body = successObject('', user)
}
