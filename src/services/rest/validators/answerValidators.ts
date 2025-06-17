import { ValidatorContext } from '../middlewares/validator'
import { Context, isFilterValid } from 'deps'
import * as questionQueries from 'queries/questions'
import { validationError } from 'utils/responseObject'
import methodsOnDbCollection from 'utils/mongodb/validQueryTypes'
import { tryCatchSync } from 'utils/tryCatch'
import extractPartsFromQuery, {
	ChainedOperation,
} from '../helpers/extractPartsFromQuery'

export const doesQuestionExist = async (ctx: ValidatorContext) => {
	if (!Object.prototype.hasOwnProperty.call(ctx, 'params')) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('Please provide Question Id', 'questionId')
	}

	const { questionId } = ctx.params

	if (!questionId || isNaN(+questionId)) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('Invalid Question Id', 'questionId')
	}

	const questionData = await questionQueries.fetchOneQuestion({
		questionId: +questionId,
	})

	if (!questionData) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('No question found with this id', 'questionId')
	}

	ctx.state.shared.question = questionData

	return null
}

export const isAnswerFieldsValid = (ctx: Context) => {
	const body = ctx.request.body as Object
	const allowedFields = ['answerQuery', 'socketId']

	// limit number of fields
	if (Object.keys(body).length > allowedFields.length) {
		return validationError('Invalid amount of fields.', 'common')
	}

	// check for invalid fields
	const invalidFields = Object.keys(body).filter(
		(field) => !allowedFields.includes(field)
	)

	if (invalidFields && invalidFields.length) {
		return validationError(`Invalid Field: ${invalidFields[0]}.`, 'common')
	}

	return null
}

export const doesAnswerQueryExist = (ctx: Context) => {
	const { answerQuery } = ctx.request.body as { answerQuery: string }

	if (!answerQuery?.trim()) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('Please provide query', 'answerQuery')
	}

	ctx.state.shared.answer = { answerQuery }

	return null
}

export const isQueryPartsValid = (ctx: Context) => {
	const sharedAnswer = ctx.state.shared.answer
	const { answerQuery } = sharedAnswer as { answerQuery: string }

	const {
		errorMessage,
		collection,
		queryType,
		queryFilter,
		queryUpdate,
		queryOptions,
		chainedOps,
	} = extractPartsFromQuery(answerQuery)

	if (errorMessage) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError(errorMessage, 'answerQuery')
	}

	ctx.state.shared.answer = {
		...sharedAnswer,
		collection,
		queryType,
		queryFilter,
		queryUpdate,
		queryOptions,
		chainedOps,
	}

	return null
}

export const isCollectionValid = (ctx: Context) => {
	const { collection } = ctx.state.shared.answer

	if (!collection || !collection.trim()) {
		return validationError('Please Provide Collection Name', 'collection')
	}

	const collectionNameRegex = /^[a-zA-Z0-9_]+$/
	if (!collectionNameRegex.test(collection) || collection.length > 64) {
		return validationError('Invalid Collection Name Format', 'collection')
	}

	return null
}

// TODO: add validation for queryType, in a way that it stats with is "not supported"
export const isQueryTypeValid = (ctx: Context) => {
	const { queryType } = ctx.state.shared.answer
	// const { validQueryTypes } = ctx.state.shared.question
	// const { currentlySupportedQueryTypes } = methodsOnDbCollection

	if (!queryType || !queryType.trim()) {
		return validationError('Invalid Query Type', 'queryType')
	}

	// if (!currentlySupportedQueryTypes.includes(queryType)) {
	// 	return validationError('Invalid Query Type', 'queryType')
	// }

	// if (!validQueryTypes.includes(queryType)) {
	// 	return validationError(
	// 		'This QueryType not supported in this question',
	// 		'queryType'
	// 	)
	// }

	return null
}

export const isQueryFilterValid = (ctx: Context) => {
	const { queryFilter } = ctx.state.shared.answer

	console.log('queryFilter', queryFilter, typeof queryFilter)

	const isFilterValidResponse = isFilterValid(queryFilter)
	console.log(
		'isFilterValidResponse',
		isFilterValidResponse,
		typeof isFilterValidResponse
	)
	if (!isFilterValidResponse) {
		return validationError('Invalid Query Filter', 'queryFilter')
	}

	ctx.state.shared.answer.queryFilter = isFilterValidResponse

	return null
}

export const isQueryUpdateValid = (ctx: Context) => {
	const { queryUpdate } = ctx.state.shared.answer

	if (queryUpdate === null || queryUpdate === undefined) {
		return null
	}

	const isUpdateValidResponse = isFilterValid(queryUpdate)

	if (!isUpdateValidResponse) {
		return validationError('Invalid Query Update', 'queryUpdate')
	}

	ctx.state.shared.answer.queryUpdate = isUpdateValidResponse

	return null
}

export const isQueryOptionsValid = (ctx: Context) => {
	const { queryOptions } = ctx.state.shared.answer

	if (queryOptions === null || queryOptions === undefined) {
		return null
	}

	const isOptionsValidResponse = isFilterValid(queryOptions)

	if (!isOptionsValidResponse) {
		return validationError('Invalid Query Options', 'queryOptions')
	}

	ctx.state.shared.answer.queryOptions = isOptionsValidResponse

	return null
}

export const isChainedOpsValid = (ctx: Context) => {
	const { chainedOps } = ctx.state.shared.answer
	const { validChainedOperations } = methodsOnDbCollection

	// If no chained operations, that's valid
	if (!chainedOps || !Array.isArray(chainedOps) || chainedOps.length === 0) {
		return null
	}

	// Create a new array with validated operations
	const validatedOps: ChainedOperation[] = []

	// Validate each chained operation
	for (let i = 0; i < chainedOps.length; i++) {
		const op = chainedOps[i]

		// Check if operation exists and is a string
		if (!op || typeof op.operation !== 'string' || !op.operation.trim()) {
			return validationError(
				`Invalid chained operation at position ${i}`,
				'chainedOps'
			)
		}

		// Check if operation is in whitelist
		if (!validChainedOperations.includes(op.operation)) {
			return validationError(
				`Unsupported operation: ${op.operation}`,
				'chainedOps'
			)
		}

		// Create a new object for the validated operation
		const validatedOp: ChainedOperation = {
			operation: op.operation,
			params: op.params,
		}

		// Validate params based on operation type
		if (op.operation === 'sort' || op.operation === 'project') {
			// These should be objects

			const [, error] = tryCatchSync(() => {
				const paramsValid = isFilterValid(op.params)

				if (!paramsValid) {
					return validationError(
						`Invalid params for ${op.operation}`,
						'chainedOps'
					)
				}

				validatedOp.params = paramsValid
				return true
			})

			if (error) {
				console.log({ error })
				return validationError(
					`Invalid JSON in params for ${op.operation}`,
					'chainedOps'
				)
			}
		} else if (op.operation === 'skip' || op.operation === 'limit') {
			// These should be numbers
			const numValue = parseInt(op.params as string)
			if (isNaN(numValue) || numValue < 0) {
				return validationError(
					`Invalid numeric value for ${op.operation}`,
					'chainedOps'
				)
			}

			// Set numeric value as params
			validatedOp.params = numValue
		}

		validatedOps.push(validatedOp)
	}

	// Update the validated chainedOps
	ctx.state.shared.answer.chainedOps = validatedOps

	return null
}

export const isSocketIdValid = (ctx: Context) => {
	const { socketId } = ctx.request.body as { socketId: string }

	if (!socketId || !socketId.trim()) {
		return validationError('Please provide Socket Id', 'socketId')
	}

	ctx.state.shared.answer.socketId = socketId

	return null
}

export const isSubmissionIdValid = (ctx: Context) => {
	if (
		!Object.prototype.hasOwnProperty.call(ctx.request.body, 'submissionId')
	) {
		return validationError('Please provide Submission Id', 'submissionId')
	}

	const { submissionId } = ctx.request.body as { submissionId: string }

	if (!submissionId || !submissionId.trim()) {
		return validationError('Invalid Submission Id', 'submissionId')
	}

	ctx.state.shared.submissionId = submissionId

	return null
}
