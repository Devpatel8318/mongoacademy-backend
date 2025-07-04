export default {
	host: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
	username: process.env.REDIS_USERNAME || '',
	password: process.env.REDIS_PASSWORD || '',
	doNotCache: process.env.DO_NOT_CACHE || 'false',
}
