import { Router } from 'deps'

import {
	getAllQuestions,
	viewQuestion,
	getSolution,
	bookmarkQuestion,
} from '../controllers/question.controller'

import auth from '../middlewares/auth'
import validator from '../middlewares/validator'
import {
	isQuestionIdValid,
	isQuestionListQueryParamsValid,
} from '../validators/questionValidators'

const router = new Router({ prefix: '/question' })

// TODO: add validators , (limit must be less than approx 500, and for all other params)
router.get(
	'/list',
	auth,
	validator([isQuestionListQueryParamsValid]),
	getAllQuestions
)

router.get(
	'/view/:questionId',
	auth,
	validator([isQuestionIdValid]),
	viewQuestion
)

router.post(
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
