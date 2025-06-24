import { Document, Filter, UpdateFilter, UpdateOptions } from 'deps'
import MongoDB from 'src/connection/MongoDb/primaryConnection'

const collectionName = 'questionProgress'

export const updateOneQuestionProgress = async (
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
