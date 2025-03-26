import config from 'config'
import { Context } from 'deps'
import * as questionQueries from 'queries/questions'
import { emailValidator } from 'utils/emailValidator'
import { validationError } from 'utils/responseObject'
import { isTokenValid } from 'services/admin/helpers/jwtFunctions'

export const isLoginFieldsValid = (ctx: Context) => {
	const { body } = ctx.request as { body: Record<string, any> }
	const allowedFields = ['email', 'password']

	// limit number of fields
	if (Object.keys(body).length > allowedFields.length) {
		return 'Invalid amount of fields.'
	}

	//check for invalid fields
	const invalidFields = Object.keys(body).filter(
		(field) => !allowedFields.includes(field)
	)

	if (invalidFields && invalidFields.length) {
		return validationError(`Invalid Field: ${invalidFields[0]}.`, 'common')
	}

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

export const isCredentialsCorrect = (ctx: Context) => {
	const { email, password } = ctx.request.body as {
		email: string
		password: string
	}
	const { validationErrors } = ctx.state

	if (validationErrors.length) return null

	if (
		email !== config.admin.ADMIN_EMAIL ||
		password !== config.admin.ADMIN_PASSWORD
	) {
		ctx.throw(401, 'Invalid Credentials')
	}

	return null
}

export const doesQuestionExist = async (ctx: Context) => {
	const { questionId = '' } = ctx.query

	const questionData = await questionQueries.getOneQuestion({
		questionId: +questionId,
	})

	if (!questionData) {
		return 'question not found.'
	}

	ctx.state.question = questionData

	return null
}

export const isRefreshTokenValid = async (ctx: Context) => {
	const refreshToken = await ctx.cookies.get(
		config.cookie.REFRESH_TOKEN_COOKIE_NAME
	)

	if (!refreshToken || !isTokenValid(refreshToken)) {
		ctx.throw(401, 'Invalid Refresh Token')
	}

	return null
}
