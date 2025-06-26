import mongoDB from 'MongoDbConnection'
const collectionName = 'auth'

export interface User {
	userId: number
	email: string
	password?: string
	googleId?: string
	profilePictureUrl?: string
	createdAt: Date
}

export const fetchOneUserByEmail = async (email: string) => {
	return await mongoDB.collection(collectionName).findOne({ email })
}

export const insertUser = async (userDoc: User) => {
	return await mongoDB.collection(collectionName).insertOne(userDoc)
}

export const updateOneUser = async (
	filter: Partial<User> = {},
	updateData: Partial<User>
) => {
	return await mongoDB
		.collection(collectionName)
		.updateOne(filter, { $set: updateData })
}
