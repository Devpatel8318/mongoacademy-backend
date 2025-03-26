import { Router } from 'deps'
import validator from 'services/rest/middlewares/validator'
import {
	areAuthFieldsValid,
	doesUserExist,
	isAuthProvided,
	isCredentialsCorrect,
	isEmailAvailable,
	isEmailProvided,
	isEmailValid,
	isGoogleAuthValid,
	isPasswordProvided,
	isPasswordValid,
	isRefreshTokenValid,
	isLoginMethodEmailPassword,
} from 'services/rest/validators/authValidators'
import {
	loginUser,
	logoutUser,
	oauthGoogle,
	provideAccessToken,
	signup,
} from 'services/rest/controllers/auth.controller'

const router = new Router({ prefix: '/auth' })

// router.post('/signup', )

router.post(
	'/signup',
	validator([
		areAuthFieldsValid,
		isEmailProvided,
		isPasswordProvided,
		isEmailValid,
		isPasswordValid,
		isEmailAvailable,
	]),
	signup
)

router.post(
	'/login',
	validator([
		areAuthFieldsValid,
		isEmailProvided,
		isPasswordProvided,
		isEmailValid,
		doesUserExist,
		isLoginMethodEmailPassword,
		isCredentialsCorrect,
	]),
	loginUser
)

router.post(
	'/google',
	validator([isAuthProvided, isGoogleAuthValid]),
	oauthGoogle
)

router.get('/refresh', validator([isRefreshTokenValid]), provideAccessToken)

router.get('/logout', logoutUser)

export default router
