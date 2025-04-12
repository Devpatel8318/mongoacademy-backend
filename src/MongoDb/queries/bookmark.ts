import MongoDB from '../connection'

const collectionName = 'bookmark'

export const fetchOneBookmark = async (userId: number, questionId: number) => {
	return await MongoDB.collection(collectionName).findOne({
		userId,
		questionId,
	})
}

export const insertOneBookmark = async (userId: number, questionId: number) => {
	return await MongoDB.collection(collectionName).insertOne({
		userId,
		questionId,
	})
}

export const deleteOneBookmark = async (userId: number, questionId: number) => {
	return await MongoDB.collection(collectionName).deleteOne({
		userId,
		questionId,
	})
}
