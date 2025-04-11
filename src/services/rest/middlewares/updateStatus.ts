import { Context, Next } from 'deps'
import MongoDB from '../../../MongoDb/connection'
import { Status } from 'Types/global'

export interface StatusDocument {
	userId: string
	questionId: string
	status: Status
}

const updateStatus = async (ctx: Context, next: Next) => {
	const { question, user } = ctx.state.shared
	const { userId } = user
	const { questionId } = question

	const statusDocument = await MongoDB.collection<StatusDocument>(
		'status'
	).findOne({
		userId,
		questionId,
	})

	if (!statusDocument) {
		await MongoDB.collection('status').insertOne({
			userId,
			questionId,
			status: 'ATTEMPTED',
		})
	}

	return next()
}

export default updateStatus
