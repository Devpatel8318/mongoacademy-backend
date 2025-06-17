import config from 'config'
import { Context, Next } from 'deps'

import { isTokenValid } from '../helpers/jwtFunctions'

const auth = async (ctx: Context, next: Next) => {
	const accessTokenName = config.cookie.ACCESS_TOKEN_COOKIE_NAME
	const cookie = ctx.cookies.get(accessTokenName)

	if (!cookie) {
		ctx.throw(401, 'Invalid User 1')
	}

	const decodedToken = isTokenValid(cookie)

	if (!decodedToken) {
		ctx.throw(401, 'Invalid User 2')
	}

	if (!decodedToken.email || typeof decodedToken.email !== 'string') {
		ctx.throw(401, 'Invalid User 4')
	}

	if (!decodedToken.userId || typeof decodedToken.userId !== 'number') {
		ctx.throw(401, 'Invalid User 5')
	}

	const { email, userId } = decodedToken

	ctx.state.shared = { user: { email, userId } }

	return next()
}

export default auth
