import { Router } from 'deps'

// import auth from '../middlewares/auth';
import validator from '../middlewares/validator'

import {
	doesQuestionExist,
	isCredentialsCorrect,
	isEmailProvided,
	isEmailValid,
	isLoginFieldsValid,
	isPasswordProvided,
	isRefreshTokenValid,
} from '../validators/adminValidators'

import {
	getAllQuestions,
	getOneQuestions,
	loginAdmin,
	logoutUser,
	provideAccessToken,
} from '../controllers/adminController'
import auth from '../middlewares/auth'

const router = new Router({ prefix: '/admin' })

router.post(
	'/login',
	validator([
		isLoginFieldsValid,
		isEmailProvided,
		isPasswordProvided,
		isEmailValid,
		isCredentialsCorrect,
	]),
	loginAdmin
)

router.get('/refresh', validator([isRefreshTokenValid]), provideAccessToken)

router.get('/logout', logoutUser)

// read all
// router.get('/list', auth, getAllQuestions);
router.get('/list', auth, getAllQuestions)

// read one
router.get('/view/:questionId', validator([doesQuestionExist]), getOneQuestions)

// create
router.post('/list', getAllQuestions)

// update
router.put('/list', getAllQuestions)

// delete
router.delete('/list', getAllQuestions)

export default router
