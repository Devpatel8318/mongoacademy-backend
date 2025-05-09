// TODO: use implementation in which redis only initializes once
import { Redis } from 'deps'
import config from 'config'

const connectObject = {
	host: config.redis.host,
	port: config.redis.port,
}

if (config.common.NODE_ENV === 'production') {
	Object.assign(connectObject, {
		username: config.redis.username,
		password: config.redis.password,
	})
}

const redis = new Redis(connectObject)

redis.on('ready', () => {
	console.log('Connected to Redis')
})

redis.on('error', (err) => {
	console.error('Redis connection error:', err)
	process.exit(1)
})

export default redis
