import { Context, Next } from 'deps'
import crypto from 'crypto'
import * as submissionQueries from 'queries/submission'

const addSubmission = async (ctx: Context, next: Next) => {
	const { question, user, answer } = ctx.state.shared
	const { userId } = user
	const { questionId } = question
	const { answerQuery } = answer

	const submissionId = crypto.randomUUID()

	await submissionQueries.insertOneSubmission({
		submissionId,
		userId,
		questionId,
		query: answerQuery,
		createdAt: Date.now(),
		status: 'PENDING',
	})

	ctx.state.shared.answer = {
		...ctx.state.shared.answer,
		submissionId,
	}

	return next()
}

export default addSubmission
