import { MongoClient } from 'deps'
import config from 'config'
import { tryCatch } from 'utils/tryCatch'

const client = new MongoClient(config.mongoDB.URL)

async function connectToDB() {
	const [, error] = await tryCatch(client.connect())

	if (error) {
		console.error('Error connecting to MongoDB:', error)
		return
	}

	console.log('Connected to MongoDB')
}

connectToDB() // Call the function to connect to MongoDB

export const MongoDB = client.db(config.mongoDB.DB_NAME)
export default MongoDB
