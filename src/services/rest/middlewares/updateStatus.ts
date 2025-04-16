import { Context, Next } from 'deps'
import * as statusQueries from 'queries/status'

const updateStatus = async (ctx: Context, next: Next) => {
	const { question, user } = ctx.state.shared
	const { userId } = user
	const { questionId } = question

	await statusQueries.updateOneStatus(
		{ userId, questionId: +questionId },
		{
			$setOnInsert: {
				userId,
				questionId: +questionId,
				status: 1,
			},
		},
		{ upsert: true }
	)

	return next()
}

export default updateStatus
