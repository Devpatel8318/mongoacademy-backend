import MongoDB from '../connection'

const collectionName = 'status'

export const fetchOneStatus = async (userId: number, questionId: number) => {
	return await MongoDB.collection(collectionName).findOne({
		userId,
		questionId,
	})
}

export const fetchStatus = async (filter: object) => {
	return await MongoDB.collection(collectionName).find(filter).toArray()
}

export const insertOneStatus = async (
	userId: number,
	questionId: number,
	status: 1 | 2 | 3
) => {
	return await MongoDB.collection(collectionName).insertOne({
		userId,
		questionId,
		status,
	})
}

export const updateOneStatus = async (filter: object, newDoc: object) => {
	return await MongoDB.collection(collectionName).updateOne(filter, newDoc)
}
