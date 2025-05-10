import config from 'config'
import { Context, Next } from 'deps'

import * as authQueries from 'queries/auth'

import { isTokenValid } from '../helpers/jwtFunctions'

const auth = async (ctx: Context, next: Next) => {
	const accessTokenName = config.cookie.ACCESS_TOKEN_COOKIE_NAME
	const cookie = ctx.cookies.get(accessTokenName)

	if (!cookie || typeof cookie !== 'string') {
		ctx.throw(401, 'Invalid Use1')
	}

	const decodedToken = isTokenValid(cookie)

	if (!decodedToken || typeof decodedToken.email !== 'string') {
		ctx.throw(401, 'Invalid User2')
	}

	const user = await authQueries.fetchOneUserByEmail(decodedToken.email)

	if (!user) {
		ctx.throw(401, 'Invalid User3')
	}

	const { email, userId } = user

	ctx.state.shared = { user: { email, userId } }

	return next()
}

export default auth
