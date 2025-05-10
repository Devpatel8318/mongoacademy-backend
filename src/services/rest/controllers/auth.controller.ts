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
import { tryCatchSync } from 'utils/tryCatch'
import { uploadImageFromUrlToS3 } from 'utils/aws/S3/uploadMediaToS3'
import buckets from 'utils/aws/S3/buckets'

export const signup = async (ctx: Context) => {
	const { email, password } = ctx.request.body as {
		email: string
		password: string
	}

	const hashedPassword = await hashData(password)

	const userId = await createUser(email, { password: hashedPassword })

	const [, error] = tryCatchSync(() => {
		setAuthCookies(ctx, { email, userId })
	})

	if (error) {
		console.error('SignUp failed error:', error)
		ctx.throw('Signup Successful, Login Failed.')
	}

	ctx.body = successObject('Signup Successful.')
}

export const loginUser = async (ctx: Context) => {
	const { email, userId } = ctx.state.shared.user

	const [, error] = tryCatchSync(() => {
		setAuthCookies(ctx, { email, userId })
	})

	if (error) {
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

		successMessage = 'Login Successful.'
		errorMessage = 'Login Failed.'
	} else {
		// Signup
		const userId = await createUser(email, { googleId, profilePictureUrl })
		Object.assign(tokenContent, { userId })

		successMessage = 'Signup Successful.'
		errorMessage = 'Signup Failed.'
	}

	const [, error] = tryCatchSync(() => {
		setAuthCookies(ctx, tokenContent)
	})

	if (error) {
		console.error('OAuth failed error:', error)
		ctx.throw(errorMessage)
	}

	// update profile picture in s3
	await uploadImageFromUrlToS3(
		profilePictureUrl,
		email,
		buckets.profilePicturesBucket
	)

	ctx.body = successObject(successMessage)
}

export const provideAccessToken = async (ctx: Context) => {
	const { email, userId } = ctx.state.shared.user

	const [, error] = tryCatchSync(() => {
		setAccessTokenCookie({ ctx, data: { email, userId } })
	})

	if (error) {
		console.error('Refresh Token failed error:', error)
		ctx.throw('Refresh Token Failed.')
	}

	ctx.body = successObject('Access Token Provided')
}

export const logoutUser = async (ctx: Context) => {
	const [, error] = tryCatchSync(() => {
		setAccessTokenCookie({ ctx, data: {}, maxAge: 0 })
		setRefreshTokenCookie({
			ctx,
			data: {},
			maxAge: 0,
			path: '/auth/refresh',
		})
	})

	if (error) {
		console.error('Logout failed error:', error)
		ctx.throw('Logout Failed.')
	}

	ctx.body = successObject('Logged out successfully.')
}
