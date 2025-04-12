import { Context, Next } from 'deps'
import * as statusQueries from 'queries/status'

const updateStatus = async (ctx: Context, next: Next) => {
	const { question, user } = ctx.state.shared
	const { userId } = user
	const { questionId } = question

	const statusDocument = await statusQueries.fetchOneStatus(
		userId,
		+questionId
	)

	if (!statusDocument) {
		await statusQueries.insertOneStatus(userId, +questionId, 1)
	}

	return next()
}

export default updateStatus
