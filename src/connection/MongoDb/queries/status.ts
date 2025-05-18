import { Document, Filter, UpdateFilter, UpdateOptions } from 'mongodb'
import MongoDB from 'MongoDbConnection'

const collectionName = 'status'

export const fetchStatuses = async (filter: Filter<Document>) => {
	return await MongoDB.collection(collectionName).find(filter).toArray()
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
