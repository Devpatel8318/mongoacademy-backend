import { Router } from 'deps'

import {
	submitAnswer,
	runAnswer,
	evaluateAnswer,
	submissionList,
	runOnlyRetrieveData,
} from '../controllers/answer.controller'

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
	isSubmissionIdValid,
} from '../validators/answerValidators'

import { isQuestionIdValid } from '../validators/answerValidators'
import updateStatus from '../middlewares/updateStatus'
import auth from '../middlewares/auth'
import addSubmission from '../middlewares/addSubmission'

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
	addSubmission,
	submitAnswer
)

router.post(
	'/run/:questionId',
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
	runAnswer
)

router.post(
	'/evaluate/:questionId',
	auth,
	validator([isQuestionIdValid, isSubmissionIdValid]),
	evaluateAnswer
)

router.post(
	'/runonly/retrieve/:questionId',
	auth,
	validator([isQuestionIdValid]),
	runOnlyRetrieveData
)

router.get(
	'/submissions/:questionId',
	auth,
	validator([isQuestionIdValid]),
	submissionList
)

export default router
