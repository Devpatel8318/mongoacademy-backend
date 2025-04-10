import { Router } from 'deps'

import {
	getAllQuestions,
	viewQuestion,
	getSolution,
} from '../controllers/question.controller'

import auth from '../middlewares/auth'
import validator from '../middlewares/validator'
import { isQuestionIdValid } from '../validators/questionValidators'

const router = new Router({ prefix: '/question' })

router.get('/list', auth, getAllQuestions)

router.get(
	'/view/:questionId',
	auth,
	validator([isQuestionIdValid]),
	viewQuestion
)

router.post('/solution', auth, getSolution)

export default router
