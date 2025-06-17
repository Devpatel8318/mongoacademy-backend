import { MongoClient } from 'deps'
import config from 'config'
import { tryCatch } from 'utils/tryCatch'

const client = new MongoClient(config.mongoDB.READ_ONLY_URL)

async function connectToDB() {
	const [, error] = await tryCatch(client.connect())

	if (error) {
		console.error('Error connecting to Read only MongoDB:', error)
		return
	}

	console.log('Connected to Read only MongoDB')
}

connectToDB() // Call the function to connect to Read only MongoDB

export const MongoDB = client.db(config.mongoDB.READ_ONLY_DB_NAME)
export default MongoDB
