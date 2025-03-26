import { Context } from 'deps'
// import isAnswerCorrect from '../../../utils/isAnswerCorrect'
// import { failureObject, successObject } from '../../../utils/responseObject'
import { successObject } from 'utils/responseObject'

import * as questionQueries from 'queries/questions'

export const getAllQuestions = async (ctx: Context) => {
	const response = await questionQueries.getAllQuestions({
		filter: {},
		projection: { _id: 0, answer: 0 },
	})

	ctx.body = successObject('', { list: response })
}

export const getSolution = async (ctx: Context) => {
	const { questionId } = ctx.request.body as { questionId: number }

	const response = questionQueries.getAllQuestions({
		filter: { questionId },
		projection: { _id: 0 },
	})

	ctx.body = successObject('', response)
}

export const submitAnswer = async () => {
	// const { questionId, input } = ctx.request.body
	// const isAnswerCorrectResponse = await isAnswerCorrect(questionId, input)
	// ctx.body = isAnswerCorrectResponse
	// 	? successObject('Correct Answer')
	// 	: failureObject(
	// 		'Submitted answer did not got expected output',
	// 		'Wrong Answer',
	// 	)
}
