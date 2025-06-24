import { Context, Next } from 'deps'
import { setDataInRedis } from 'redisQueries'

const updateForgotPasswordRequestCount = async (ctx: Context, next: Next) => {
	const { key, count } = ctx.state.shared.forgotPasswordRequestsData
	console.log('key:', key)
	const newCount = (count || 0) + 1

	setDataInRedis(
		key,
		newCount,
		60 * 60 * 24 // 1 day expiration
	)

	return next()
}

export default updateForgotPasswordRequestCount
