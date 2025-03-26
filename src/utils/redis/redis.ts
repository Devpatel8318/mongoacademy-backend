import { Redis } from 'deps'

const connectObject = {
	hostname: process.env.REDIS_HOST || 'localhost',
	port: parseInt(process.env.REDIS_PORT || '6379'),
}

if (process.env.ENVIRONMENT === 'production') {
	Object.assign(connectObject, {
		username: process.env.REDIS_USERNAME || '',
		password: process.env.REDIS_PASSWORD || '',
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
