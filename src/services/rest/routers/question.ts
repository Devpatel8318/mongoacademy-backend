import { Router } from 'deps'

import {
	getAllQuestions,
	viewQuestion,
	getSolution,
	bookmarkQuestion,
} from '../controllers/question.controller'

import auth from '../middlewares/auth'
import validator from '../middlewares/validator'
import { isQuestionIdValid } from '../validators/questionValidators'

const router = new Router({ prefix: '/question' })

// TODO: add validators , (limit must be less than approx 500)
router.get('/list', auth, getAllQuestions)

router.get(
	'/view/:questionId',
	auth,
	validator([isQuestionIdValid]),
	viewQuestion
)

router.get(
	'/bookmark/:questionId',
	auth,
	validator([isQuestionIdValid]),
	bookmarkQuestion
)

router.get(
	'/solution/:questionId',
	auth,
	validator([isQuestionIdValid]),
	getSolution
)

export default router
