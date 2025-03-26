import config from 'config'
import { Context, Next } from 'deps'

import { isTokenValid } from '../helpers/jwtFunctions'

const auth = async (ctx: Context, next: Next) => {
	const accessTokenName = config.cookie.ADMIN_ACCESS_TOKEN_COOKIE_NAME
	const cookie = ctx.cookies.get(accessTokenName)
	const isValidToken = isTokenValid(cookie)
	if (!isValidToken) {
		ctx.throw(401, 'Permission denied.')
	}

	await next()
}

export default auth
