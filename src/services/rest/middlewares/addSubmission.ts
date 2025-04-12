import { Context, Next } from 'deps'
import MongoDB from '../../../MongoDb/connection'
import crypto from 'crypto'

const addSubmission = async (ctx: Context, next: Next) => {
	const { question, user, answer } = ctx.state.shared
	const { userId } = user
	const { questionId } = question
	const { answerQuery } = answer

	const submissionId = crypto.randomUUID()

	await MongoDB.collection('submission').insertOne({
		submissionId,
		userId,
		questionId,
		query: answerQuery,
		createdOn: Date.now(),
		status: 'PENDING',
	})

	ctx.state.shared.answer = {
		...ctx.state.shared.answer,
		submissionId,
	}

	return next()
}

export default addSubmission
