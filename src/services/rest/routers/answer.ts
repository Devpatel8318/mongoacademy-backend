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
	isQueryPartsValid,
	isCollectionValid,
	isQueryTypeValid,
	isQueryFilterValid,
	isChainedOpsValid,
	isSocketIdValid,
	isSubmissionIdValid,
	isQueryUpdateValid,
	isQueryOptionsValid,
} from '../validators/answerValidators'

import { doesQuestionExist } from '../validators/answerValidators'
import updateQuestionProgress from '../middlewares/updateQuestionProgress'
import auth from '../middlewares/auth'
import addSubmission from '../middlewares/addSubmission'
import extractQueryPartsFromQuestion from '../middlewares/extractQueryPartsFromQuestion'
import logSubmissionToCloudWatch from '../middlewares/logSubmissionToCloudWatch'

const router = new Router({ prefix: '/answer' })

router.post(
	'/submit/:questionId',
	auth,
	validator([doesQuestionExist]),
	extractQueryPartsFromQuestion,
	updateQuestionProgress,
	validator([
		isAnswerFieldsValid,
		doesAnswerQueryExist,
		isQueryPartsValid,
		isCollectionValid,
		isQueryTypeValid,
		isQueryFilterValid,
		isQueryUpdateValid,
		isQueryOptionsValid,
		isChainedOpsValid,
		isSocketIdValid,
	]),
	addSubmission,
	(ctx, next) => logSubmissionToCloudWatch(ctx, next, 'submit'),
	submitAnswer
)

router.post(
	'/run/:questionId',
	auth,
	validator([doesQuestionExist]),
	updateQuestionProgress,
	validator([
		isAnswerFieldsValid,
		doesAnswerQueryExist,
		isQueryPartsValid,
		isCollectionValid,
		isQueryTypeValid,
		isQueryFilterValid,
		isQueryUpdateValid,
		isQueryOptionsValid,
		isChainedOpsValid,
		isSocketIdValid,
	]),
	(ctx, next) => logSubmissionToCloudWatch(ctx, next, 'run'),
	runAnswer
)

router.post(
	'/evaluate/:questionId',
	auth,
	validator([doesQuestionExist, isSubmissionIdValid]),
	evaluateAnswer
)

router.post(
	'/runonly/retrieve/:questionId',
	auth,
	validator([doesQuestionExist]),
	runOnlyRetrieveData
)

router.get(
	'/submissions/:questionId',
	auth,
	validator([doesQuestionExist]),
	submissionList
)

export default router
