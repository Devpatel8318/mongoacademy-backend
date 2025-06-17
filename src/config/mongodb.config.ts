export default {
	URL: process.env.MONGODB_URL || '',
	READ_ONLY_URL: process.env.MONGODB_READ_ONLY_URL || '',
	DB_NAME: process.env.MONGODB_DB_NAME,
	READ_ONLY_DB_NAME: process.env.MONGODB_READ_ONLY_DB_NAME,
}
