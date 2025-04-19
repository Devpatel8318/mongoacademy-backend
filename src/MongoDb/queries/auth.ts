import mongoDB from 'MongoDbConnection'
const collectionName = 'auth'

export interface User {
	userId: number
	email: string
	createdAt: number // epoch time
	password?: string
	googleId?: string
	profilePictureUrl?: string
}

export const fetchOneUserByEmail = async (email: string) => {
	return await mongoDB.collection(collectionName).findOne({ email })
}

export const insertUser = async (userDoc: User) => {
	return await mongoDB.collection(collectionName).insertOne(userDoc)
}
