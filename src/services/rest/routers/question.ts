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
	doesQuestionExist,
	isQuestionListQueryParamsValid,
} from '../validators/questionValidators'

const router = new Router({ prefix: '/question' })

router.get(
	'/list',
	auth,
	validator([isQuestionListQueryParamsValid]),
	getAllQuestions
)

router.get(
	'/view/:questionId',
	auth,
	validator([doesQuestionExist]),
	viewQuestion
)

router.post(
	'/bookmark/:questionId',
	auth,
	validator([doesQuestionExist]),
	bookmarkQuestion
)

router.get(
	'/solution/:questionId',
	auth,
	validator([doesQuestionExist]),
	getSolution
)

export default router
