import config from 'config'
import { tryCatch } from 'utils/tryCatch'
import redis from './connection'

export const CACHE_NULL_MARKER = 'CACHE_NULL'

export const setDataInRedis = async (
	key: string,
	value: string | object,
	expireInSeconds?: number
): Promise<string | null> => {
	if (config.redis.doNotCache === 'true') {
		return key
	}

	const [, error] = await tryCatch(async () => {
		const data = typeof value === 'object' ? JSON.stringify(value) : value
		if (expireInSeconds) {
			await redis.set(key, data, 'EX', expireInSeconds)
		} else {
			await redis.set(key, data)
		}
	})

	if (error) {
		console.error('Set data from redis error:', error)
		return null
	}

	return key
}

export const getDataFromRedis = async (key: string): Promise<any> => {
	const [data, error] = await tryCatch(async () => {
		const data = await redis.get(key)

		if (data === CACHE_NULL_MARKER) {
			return data
		}

		return data ? JSON.parse(data) : null
	})

	if (error) {
		console.error('Get data from redis error:', error)
		return null
	}

	return data
}

export const deleteDataFromRedis = async (key: string): Promise<void> => {
	const [, error] = await tryCatch(redis.del(key))

	if (error) {
		console.error('Delete data from redis error:', error)
	}
}
