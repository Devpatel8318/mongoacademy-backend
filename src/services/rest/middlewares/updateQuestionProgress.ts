import { Context, Next } from 'deps'
import * as questionProgressQueries from 'queries/questionProgress'
import { QuestionProgressEnum } from 'Types/enums'

const updateQuestionProgress = async (ctx: Context, next: Next) => {
	const { question, user } = ctx.state.shared
	const { userId } = user
	const { questionId } = question

	await questionProgressQueries.updateOneQuestionProgress(
		{ userId, questionId: +questionId },
		{
			$setOnInsert: {
				userId,
				questionId: +questionId,
				progress: QuestionProgressEnum.ATTEMPTED,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		},
		{ upsert: true }
	)

	return next()
}

export default updateQuestionProgress
