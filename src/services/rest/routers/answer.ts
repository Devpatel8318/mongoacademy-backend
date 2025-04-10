import { Router } from 'deps'

import { submitAnswer, evaluateAnswer } from '../controllers/answer.controller'

import validator from '../middlewares/validator'
import {
	isQuestionIdValid,
	isAnswerFieldsValid,
	doesAnswerQueryExist,
	isNumberOfDotsValid,
	isDbNameValid,
	isCollectionValid,
	isQueryTypeValid,
	isQueryFilterValid,
} from '../validators/answerValidators'

const router = new Router({ prefix: '/answer' })

router.post(
	'/submit/:questionId',
	validator([
		isQuestionIdValid,
		isAnswerFieldsValid,
		doesAnswerQueryExist,
		isNumberOfDotsValid,
		isDbNameValid,
		isCollectionValid,
		isQueryTypeValid,
		isQueryFilterValid,
	]),
	submitAnswer
)

router.post(
	'/evaluate/:questionId',
	validator([isQuestionIdValid]),
	evaluateAnswer
)

export default router
