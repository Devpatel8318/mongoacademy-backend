import {
	Document,
	Filter,
	OptionalId,
	UpdateFilter,
	UpdateOptions,
} from 'mongodb'
import MongoDB from 'MongoDbConnection'

const collectionName = 'status'

export const fetchOneStatus = async (userId: number, questionId: number) => {
	return await MongoDB.collection(collectionName).findOne({
		userId,
		questionId,
	})
}

export const fetchStatuses = async (filter: Filter<Document>) => {
	return await MongoDB.collection(collectionName).find(filter).toArray()
}

export const insertOneStatus = async (doc: OptionalId<Document>) => {
	return await MongoDB.collection(collectionName).insertOne(doc)
}

export const updateOneStatus = async (
	filter: Filter<Document>,
	newDoc: Document[] | UpdateFilter<Document>,
	options?: UpdateOptions
) => {
	return await MongoDB.collection(collectionName).updateOne(
		filter,
		newDoc,
		options
	)
}
