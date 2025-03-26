import { MongoClient } from 'deps'
import config from 'config'

const client = new MongoClient(config.mongoDB.URL)

async function connectToDB() {
	try {
		await client.connect()
		console.log('Connected to MongoDB')
	} catch (error) {
		console.error('Error connecting to MongoDB:', error)
	}
}

connectToDB() // Call the function to connect to MongoDB

export const MongoDB = client.db(config.mongoDB.DB_NAME)
export default MongoDB
