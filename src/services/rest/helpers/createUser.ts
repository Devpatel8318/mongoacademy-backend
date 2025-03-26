import * as sequenceManageQueries from 'queries/sequenceManage'
import * as authQueries from 'queries/auth'

const createUser = async (email: string, data: Object) => {
	const userId = await sequenceManageQueries.getId('userId')

	const userDoc = {
		userId,
		email,
		createdAt: Date.now(),
		...data,
	}

	await authQueries.createUser(userDoc)

	return userId
}

export default createUser
