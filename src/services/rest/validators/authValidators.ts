import { axios, Context } from 'deps'
import config from 'config'
import { isTokenValid } from '../helpers/jwtFunctions'
import { validationError } from 'utils/responseObject'
import { emailValidator } from 'utils/emailValidator'

import * as authQueries from 'queries/auth'
import { verifyHash } from 'utils/hash'
import { tryCatch } from 'utils/tryCatch'

export const isRefreshTokenValid = async (ctx: Context) => {
	const refreshToken = ctx.cookies.get(
		config.cookie.REFRESH_TOKEN_COOKIE_NAME
	)

	if (!refreshToken) {
		ctx.throw(401, 'Invalid User')
	}

	const decodedToken = isTokenValid(refreshToken)

	if (!decodedToken || typeof decodedToken.email !== 'string') {
		ctx.throw(401, 'Invalid User')
	}

	const user = await authQueries.fetchOneUserByEmail(decodedToken.email)

	if (!user) {
		ctx.throw(401, 'Invalid User')
	}

	const { email, profilePictureUrl } = user

	ctx.state.shared = { user: { email, profilePictureUrl } }

	return null
}

export const isEmailProvided = (ctx: Context) => {
	const { email } = ctx.request.body as { email: string }

	if (!email || !email?.trim()) {
		return validationError('Please Provide Email', 'email')
	}

	return null
}

export const isPasswordProvided = (ctx: Context) => {
	const { password } = ctx.request.body as { password: string }

	if (!password || !password.trim()) {
		return validationError('Please Provide Password', 'password')
	}

	return null
}

export const isEmailValid = (ctx: Context) => {
	const { email } = ctx.request.body as { email: string }

	const isEmailValid = emailValidator(email)

	if (isEmailValid) {
		return validationError(isEmailValid, 'email')
	}

	return null
}

export const doesUserExist = async (ctx: Context) => {
	const { email } = ctx.request.body as { email: string }

	const user = await authQueries.fetchOneUserByEmail(email)

	if (!user) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('User does not exist', 'email')
	}

	const { password, userId, googleId } = user

	ctx.state.shared = { user: { password, email, userId, googleId } }

	return null
}

export const isLoginMethodEmailPassword = (ctx: Context) => {
	const { password, googleId } = ctx.state.shared.user

	if (!password && googleId) {
		return validationError('Please login with Google', 'common')
	}

	return null
}

export const isCredentialsCorrect = async (ctx: Context) => {
	const { validationErrors } = ctx.state

	if (validationErrors.length) return null

	const { password: originalPassword } = ctx.state.shared.user
	const { password: enteredPassword } = ctx.request.body as {
		password: string
	}

	const isPasswordCorrect = await verifyHash(
		enteredPassword,
		originalPassword
	)

	if (!isPasswordCorrect) {
		return validationError('Invalid Credentials', 'password')
	}

	return null
}

export const areAuthFieldsValid = (ctx: Context) => {
	const body = ctx.request.body as Object
	const allowedFields = ['email', 'password']

	// limit number of fields
	if (Object.keys(body).length > allowedFields.length) {
		ctx.state.continueCheckingOtherValidators = false
		return 'Invalid amount of fields.'
	}

	//check for invalid fields
	const invalidFields = Object.keys(body).filter(
		(field) => !allowedFields.includes(field)
	)

	if (invalidFields && invalidFields.length) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError(`Invalid Field: ${invalidFields[0]}.`, 'common')
	}

	return null
}

export const isEmailAvailable = async (ctx: Context) => {
	const { email } = ctx.request.body as { email: string }

	const user = await authQueries.fetchOneUserByEmail(email)

	if (user) {
		return validationError('Email already exists', 'email')
	}

	return null
}

export const isPasswordValid = (ctx: Context) => {
	const { password } = ctx.request.body as { password: string }

	if (password.length < 6) {
		return validationError(
			'Password must be atleast 6 characters long',
			'password'
		)
	}

	return null
}
export const isAuthProvided = (ctx: Context) => {
	const { code, credential } = ctx.request.body as {
		code: string
		credential: string
	}

	if (!code && !credential) {
		return validationError(
			'Please provide authentication credentials',
			'code'
		)
	}

	return null
}

export const isGoogleAuthValid = async (ctx: Context) => {
	const { code, credential } = ctx.request.body as {
		code: string
		credential: string
	}

	//  google One Tap login (ID token)
	if (credential) {
		const [googleUser, error] = await tryCatch<{
			data: { sub: string; email: string; picture: string }
		}>(
			axios.get(
				`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
			)
		)

		if (error) {
			console.error('Google One Tap token verification failed:', error)
			return validationError('Invalid token', 'credential')
		}

		const { sub, email, picture } = googleUser.data || {}

		ctx.state.shared = {
			googleId: sub,
			email,
			profilePictureUrl: picture,
		}
	}

	// OAuth Google login/signup (Authorization Code)
	if (code) {
		const [tokenResponse, tokenError] = await tryCatch<{
			access_token: string
		}>(
			axios.post('https://oauth2.googleapis.com/token', {
				client_id: config.google.googleClientId,
				client_secret: config.google.googleClientSecret,
				code,
				grant_type: 'authorization_code',
				redirect_uri: 'postmessage',
			})
		)

		if (tokenError) {
			console.error('Google OAuth token exchange failed:', tokenError)
			return validationError('Invalid authorization code', 'code')
		}

		const [googleUser, userInfoError] = await tryCatch<{
			id: string
			email: string
			picture: string
		}>(
			axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
				headers: {
					Authorization: `Bearer ${tokenResponse.access_token}`,
				},
			})
		)
		if (userInfoError) {
			console.error(
				'Google OAuth user info retrieval failed:',
				userInfoError
			)
			return validationError('Invalid authorization code', 'code')
		}

		const { id, email, picture } = googleUser

		ctx.state.shared = {
			googleId: id,
			email,
			profilePictureUrl: picture,
		}
	}

	return null
}
