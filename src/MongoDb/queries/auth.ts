import mongoDB from '../connection'
const collectionName = 'auth'

export interface User {
	userId: number
	email: string
	createdAt: number // epoch time
	password?: string
	googleId?: string
	profilePictureUrl?: string
}

export const getUserByEmail = async (email: string) => {
	return await mongoDB.collection(collectionName).findOne({ email })
}

export const createUser = async (userDoc: User) => {
	return await mongoDB.collection(collectionName).insertOne(userDoc)
}
