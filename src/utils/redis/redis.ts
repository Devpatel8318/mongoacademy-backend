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
})

export const setDataInRedis = async (
	key: string,
	value: string | object,
	expireIn?: number
): Promise<string | null> => {
	try {
		const data = typeof value === 'object' ? JSON.stringify(value) : value
		if (expireIn) {
			await redis.set(key, data, 'EX', expireIn)
		} else {
			await redis.set(key, data)
		}
		return key
	} catch (error) {
		console.log('Set data from redis error:', error)
		return null
	}
}

export const getDataFromRedis = async (key: string): Promise<any> => {
	try {
		const data = await redis.get(key)
		return data ? JSON.parse(data) : null
	} catch (error) {
		console.log('Get data from redis error:', error)
		return null
	}
}
