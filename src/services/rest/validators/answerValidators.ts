import { ValidatorContext } from '../middlewares/validator'
import { Context, isFilterValid } from 'deps'
import * as questionQueries from '../../../MongoDb/queries/questions'
import { validationError } from 'utils/responseObject'
import methodsOnDbCollection from 'utils/mongodb/validQueryTypes'
import { tryCatchSync } from 'utils/tryCatch'

export const isQuestionIdValid = async (ctx: ValidatorContext) => {
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

	ctx.state.shared.question = {
		...questionData,
	}

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

// Extract the main query parameters by finding matching parentheses
const extractBetweenMatchingParentheses = (str: string, startPos: number) => {
	let openCount = 0
	let closeCount = 0
	let startFound = false
	let start = -1

	for (let i = startPos; i < str.length; i++) {
		if (str[i] === '(') {
			if (!startFound) {
				start = i + 1
				startFound = true
			}
			openCount++
		} else if (str[i] === ')') {
			closeCount++
			if (startFound && openCount === closeCount) {
				return str.substring(start, i)
			}
		}
	}
	return ''
}

interface ChainedOperation {
	operation: string
	params: string | number | Record<string, any>
}

export const isNumberOfDotsValid = (ctx: Context) => {
	const sharedAnswer = ctx.state.shared.answer
	const { answerQuery } = sharedAnswer as { answerQuery: string }

	const dbCollectionRegex = /db\.(\w+)\.(\w+)\(/
	const dbCollectionMatch = answerQuery.match(dbCollectionRegex)

	if (!dbCollectionMatch) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('Invalid MongoDB query string format')
	}

	const [, collection, queryType] = dbCollectionMatch

	// Find the position of the query type function
	const queryTypePos = answerQuery.indexOf(`${queryType}(`)
	const queryFilter = extractBetweenMatchingParentheses(
		answerQuery,
		queryTypePos
	)

	// Extract chained operations
	const chainedOps = [] as ChainedOperation[]
	let remainingQuery = answerQuery
	let dotOpIndex = remainingQuery.indexOf('.')

	// Skip the first operation (the main query)
	if (dotOpIndex !== -1) {
		dotOpIndex = remainingQuery.indexOf('.', dotOpIndex + 1)
	}

	while (dotOpIndex !== -1) {
		// Extract the operation name
		const opStartIndex = dotOpIndex + 1
		const opEndIndex = remainingQuery.indexOf('(', opStartIndex)
		if (opEndIndex === -1) break

		const operation = remainingQuery.substring(opStartIndex, opEndIndex)

		// Extract the operation parameters
		const params = extractBetweenMatchingParentheses(
			remainingQuery,
			opEndIndex
		)

		if (operation !== queryType) {
			chainedOps.push({
				operation,
				params: params.trim(),
			})
		}

		// Move past this operation to find the next one
		const closeParenIndex = remainingQuery.indexOf(')', opEndIndex)
		if (closeParenIndex === -1) break

		dotOpIndex = remainingQuery.indexOf('.', closeParenIndex)
	}

	ctx.state.shared.answer = {
		...sharedAnswer,
		collection,
		queryType,
		queryFilter,
		chainedOps,
	}

	return null
}

export const isCollectionValid = (ctx: Context) => {
	const { collection } = ctx.state.shared.answer
	const { validCollections } = ctx.state.shared.question

	if (!collection || !collection.trim()) {
		return validationError('Please Provide Collection Name', 'collection')
	}

	const collectionNameRegex = /^[a-zA-Z0-9_]+$/
	if (!collectionNameRegex.test(collection) || collection.length > 64) {
		return validationError('Invalid Collection Name Format', 'collection')
	}

	if (!validCollections.includes(collection)) {
		return validationError('Invalid Collection Name', 'collection')
	}

	return null
}

export const isQueryTypeValid = (ctx: Context) => {
	const { queryType } = ctx.state.shared.answer
	// const { validQueryTypes } = ctx.state.shared.question
	const { currentlySupportedQueryTypes } = methodsOnDbCollection

	if (!queryType || !queryType.trim()) {
		return validationError('Invalid Query Type', 'queryType')
	}

	if (!currentlySupportedQueryTypes.includes(queryType)) {
		return validationError('Invalid Query Type', 'queryType')
	}

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

	if (!queryFilter || !queryFilter.trim()) {
		return validationError('Invalid Query Filter', 'queryFilter')
	}

	const isFilterValidResponse = isFilterValid(queryFilter)

	if (!isFilterValidResponse) {
		return validationError('Invalid Query Filter', 'queryFilter')
	}

	ctx.state.shared.answer.queryFilter = isFilterValidResponse

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

		console.log({
			op,
		})
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
