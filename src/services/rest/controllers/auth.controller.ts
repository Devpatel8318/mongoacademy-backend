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
import sendEmail from 'utils/mail/sendEmail'
import crypto from 'crypto'
import { setDataInRedis } from 'redisQueries'
import config from 'config'
import { EMAIL_TYPES } from 'utils/mail/templates'
import { logToCloudWatch } from 'utils/aws/cloudWatch/logToCloudWatch'

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
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				userId,
				message: 'SignUp failed error',
				error,
			},
		})
		ctx.throw()
	}

	ctx.body = successObject('Signup Successful.')
}

export const loginUser = async (ctx: Context) => {
	const { email, userId, profilePictureUrl } = ctx.state.shared.user

	const [, error] = tryCatchSync(() => {
		setAuthCookies(ctx, { email, userId, profilePictureUrl })
	})

	if (error) {
		console.error('Login failed error:', error)
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				userId,
				message: 'Login failed error',
				error,
			},
		})
		ctx.throw()
	}

	ctx.body = successObject('Login Successful.')
}

export const oauthGoogle = async (ctx: Context) => {
	const { googleId, email, profilePictureUrl } = ctx.state.shared

	const user = await authQueries.fetchOneUserByEmail(email)
	let successMessage: string
	let errorMessage: string

	const tokenContent = { email }

	// Login
	if (user) {
		if (!user.googleId) {
			// registered using email and password but logging in with oauth
			ctx.throw(400, 'Please log in using email and password.')
		}
		Object.assign(tokenContent, { userId: user.userId })

		successMessage = 'Login Successful.'
		errorMessage = 'Login Failed.'
	} else {
		// Signup
		const userId = await createUser(email, { googleId, profilePictureUrl })
		Object.assign(tokenContent, {
			userId,
			...(profilePictureUrl && { profilePictureUrl }),
		})

		successMessage = 'Signup Successful.'
		errorMessage = 'Signup Failed.'
	}

	if (errorMessage) {
		console.error('OAuth failed error:', errorMessage)
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				googleId,
				email,
				message: 'OAuth failed error',
				error: errorMessage,
			},
		})
	}

	const [, error] = tryCatchSync(() => {
		setAuthCookies(ctx, tokenContent)
	})

	if (error) {
		console.error('OAuth failed error:', error)
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				googleId,
				email,
				message: 'OAuth failed error',
				error,
			},
		})
		ctx.throw(400, error)
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
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				userId,
				message: 'Refresh Token failed error',
				error,
			},
		})
		ctx.throw()
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
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				message: 'Logout failed error',
				error,
			},
		})
		ctx.throw()
	}

	ctx.body = successObject('Logged out successfully.')
}

export const forgotPassword = async (ctx: Context) => {
	const { email } = ctx.request.body as { email: string }

	const token = crypto.randomBytes(32).toString('hex')

	const key = `forgot-password-token:${token}`

	setDataInRedis(
		key,
		{ token, email },
		config.common.forgotPasswordRequestTimeout
	)

	const link = `${config.common.userFrontendUrl}/reset-password?token=${token}`

	const response = await sendEmail(email, EMAIL_TYPES.FORGOT_PASSWORD, {
		link,
	})

	if (!response.success) {
		console.error('Failed to send forgot password email:', response.error)
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				email,
				message: 'Failed to send forgot password email',
				error: response.error,
			},
		})
		ctx.throw()
	}

	ctx.body = successObject('Password reset link sent to your email.')
}

export const resetPassword = async (ctx: Context) => {
	const { email } = ctx.state.shared.resetPasswordData
	const { password } = ctx.request.body as {
		password: string
	}
	const hashedPassword = await hashData(password)

	await authQueries.updateOneUser({ email }, { password: hashedPassword })

	ctx.body = successObject('Password reset successful.')
}
