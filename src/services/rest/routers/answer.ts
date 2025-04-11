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
	isSocketIdValid,
} from '../validators/answerValidators'

import { isQuestionIdValid } from '../validators/answerValidators'
import updateStatus from '../middlewares/updateStatus'
import auth from '../middlewares/auth'

const router = new Router({ prefix: '/answer' })

router.post(
	'/submit/:questionId',
	auth,
	validator([isQuestionIdValid]),
	updateStatus,
	validator([
		isAnswerFieldsValid,
		doesAnswerQueryExist,
		isNumberOfDotsValid,
		isCollectionValid,
		isQueryTypeValid,
		isQueryFilterValid,
		isChainedOpsValid,
		isSocketIdValid,
	]),
	submitAnswer
)

router.post(
	'/evaluate/:questionId',
	auth,
	validator([isQuestionIdValid]),
	evaluateAnswer
)

export default router
