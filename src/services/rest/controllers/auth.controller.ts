import { Context } from 'deps'
import {
	setAccessTokenCookie,
	setAuthCookies,
	setRefreshTokenCookie,
} from 'services/rest/helpers/cookieHelper'
import { successObject } from 'utils/responseObject'
import * as authQueries from 'queries/auth'
import createUser from 'services/rest/helpers/createUser'
import { hashData } from 'utils/hash'

export const signup = async (ctx: Context) => {
	const { email, password } = ctx.request.body as {
		email: string
		password: string
	}

	const hashedPassword = await hashData(password)

	const userId = await createUser(email, { password: hashedPassword })

	try {
		setAuthCookies(ctx, { email, userId })
	} catch (error) {
		console.error('SignUp failed error:', error)
		ctx.throw('Signup Successful, Login Failed.')
	}

	ctx.body = successObject('Signup Successful.')
}

export const loginUser = async (ctx: Context) => {
	const { email, userId } = ctx.state.shared.user

	try {
		setAuthCookies(ctx, {
			email,
			userId,
		})
	} catch (error) {
		console.error('Login failed error:', error)
		ctx.throw('Login Failed.')
	}
	ctx.body = successObject('Login Successful.')
}

export const oauthGoogle = async (ctx: Context) => {
	const { googleId, email, profilePictureUrl } = ctx.state.shared

	const user = await authQueries.fetchOneUserByEmail(email)
	let successMessage = ''
	let errorMessage = ''

	const tokenContent = { email }

	// Login
	if (user) {
		if (!user.googleId) {
			// registered using email and password but logging in with oauth
			ctx.throw(401, 'Please log in using email and password.')
		}
		Object.assign(tokenContent, { userId: user.userId })

		successMessage = 'Login Successful'
		errorMessage = 'Login Failed.'
	} else {
		// Signup
		const userId = await createUser(email, { googleId, profilePictureUrl })
		Object.assign(tokenContent, { userId })

		successMessage = 'Signup Successful.'
		errorMessage = 'Signup Failed.'
	}

	try {
		setAuthCookies(ctx, tokenContent)
	} catch (error) {
		console.error('OAuth failed error:', error)
		ctx.throw(errorMessage)
	}

	ctx.body = successObject(successMessage)
}

export const provideAccessToken = async (ctx: Context) => {
	const { email, userId } = ctx.state.shared.user

	try {
		setAccessTokenCookie({ ctx, data: { email, userId } })
	} catch (error) {
		console.error('Refresh Token failed error:', error)
		ctx.throw('Refresh Token Failed.')
	}

	ctx.body = successObject('Access Token Provided')
}

export const logoutUser = async (ctx: Context) => {
	try {
		setAccessTokenCookie({ ctx, data: {}, maxAge: 0 })
		setRefreshTokenCookie({
			ctx,
			data: {},
			maxAge: 0,
			path: '/auth/refresh',
		})
	} catch (error) {
		console.error('Logout failed error:', error)
		ctx.throw('Logout Failed.')
	}

	ctx.body = successObject('Logged out successfully.')
}
