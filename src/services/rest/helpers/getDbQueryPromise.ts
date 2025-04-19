import { Collection } from 'mongodb'
import MongoDB from 'MongoDbConnection'

const methodsReturningCursor = [
	'find',
	'aggregate',
	'listIndexes',
	'listCollections',
]

export interface DatabaseSchemaQueryType {
	collection: string
	queryType: keyof typeof Collection
	queryFilter: string
}

const getDbQueryPromise = (query: DatabaseSchemaQueryType) => {
	const { collection, queryType, queryFilter } = query

	const mongoQuestionCollection = MongoDB.collection(collection)

	if (methodsReturningCursor.includes(queryType)) {
		if (queryType in mongoQuestionCollection) {
			return (mongoQuestionCollection[queryType] as Function)(
				queryFilter
			).toArray()
		}
	}

	if (queryType in mongoQuestionCollection) {
		return (mongoQuestionCollection[queryType] as Function)(queryFilter)
	}
}

export default getDbQueryPromise
