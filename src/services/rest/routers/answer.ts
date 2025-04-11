import { Router } from 'deps'

import { submitAnswer, evaluateAnswer } from '../controllers/answer.controller'

import validator from '../middlewares/validator'
import {
	isAnswerFieldsValid,
	doesAnswerQueryExist,
	isNumberOfDotsValid,
	isCollectionValid,
	isQueryTypeValid,
	isQueryFilterValid,
	isChainedOpsValid,
} from '../validators/answerValidators'

import { isQuestionIdValid } from '../validators/questionValidators'

const router = new Router({ prefix: '/answer' })

router.post(
	'/submit/:questionId',
	validator([
		isQuestionIdValid,
		isAnswerFieldsValid,
		doesAnswerQueryExist,
		isNumberOfDotsValid,
		isCollectionValid,
		isQueryTypeValid,
		isQueryFilterValid,
		isChainedOpsValid,
	]),
	submitAnswer
)

router.post(
	'/evaluate/:questionId',
	validator([isQuestionIdValid]),
	evaluateAnswer
)

export default router
