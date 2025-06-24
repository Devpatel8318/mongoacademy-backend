import { Collection, Db } from 'deps'

export interface DatabaseSchemaQueryType {
	collection: string
	queryType: keyof typeof Collection
	queryFilter: string
}

const getDbQueryPromise = (MongoDB: Db, query: DatabaseSchemaQueryType) => {
	const { collection, queryType, queryFilter } = query

	const mongoQuestionCollection = MongoDB.collection(collection)

	if (queryType in mongoQuestionCollection) {
		return (mongoQuestionCollection[queryType] as Function)(queryFilter)
	}
}

export default getDbQueryPromise
