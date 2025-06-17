import MongoDB from 'src/connection/MongoDb/primaryConnection'

const collectionName = 'submission'

export const insertOneSubmission = async (doc: object) => {
	return await MongoDB.collection(collectionName).insertOne(doc)
}

export const updateOneSubmission = async (filter: object, newDoc: object) => {
	return await MongoDB.collection(collectionName).updateOne(filter, newDoc)
}

export const fetchSubmissions = async (
	filter: object,
	project: object = {}
) => {
	return await MongoDB.collection(collectionName)
		.find(filter)
		.project(project)
		.sort({ createdAt: -1 })
		.toArray()
}
