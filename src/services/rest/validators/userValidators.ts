import { ValidatorContext } from '../middlewares/validator'
import { Context, isFilterValid } from 'deps'
import * as questionQueries from '../../../MongoDb/queries/questions'
import { validationError } from 'utils/responseObject'
import methodsOnDbCollection from 'utils/mongodb/validQueryTypes'

export const isQuestionIdValid = async (ctx: ValidatorContext) => {
	if (!('params' in ctx)) {
		ctx.state.continueCheckingOtherValidators = false
		return 'Invalid Question Id'
	}

	const { questionId } = ctx.params

	if (!questionId || isNaN(+questionId)) {
		ctx.state.continueCheckingOtherValidators = false
		return 'Invalid Question Id'
	}

	const questionData = await questionQueries.getOneQuestion({
		questionId: +questionId,
	})

	if (!questionData) {
		ctx.state.continueCheckingOtherValidators = false
		return 'Invalid Question Id'
	}

	ctx.state.shared.question = {
		...questionData,
		filter: JSON.parse(questionData.filter),
	}

	return null
}

export const isAnswerFieldsValid = (ctx: Context) => {
	const body = ctx.request.body as Object
	const allowedFields = ['queryData']

	// limit number of fields
	if (Object.keys(body).length > allowedFields.length) {
		return 'Invalid amount of fields.'
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

export const doesQueryDataExist = (ctx: Context) => {
	const { queryData } = ctx.request.body as { queryData: string }

	if (!queryData?.trim()) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('Please Provide QueryData', 'queryData')
	}

	ctx.state.shared.answer = { queryData }

	return null
}

const countCharacter = (str: string, char: string) => {
	return str.split(char).length - 1
}

// currently only supporting basic crud, TODO: in future support .sort .limit .skip
export const isNumberOfDotsValid = (ctx: Context) => {
	const sharedAnswer = ctx.state.shared.answer
	const { queryData } = sharedAnswer as { queryData: string }

	if (countCharacter(queryData, '.') !== 2) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError(
			'Please Provide QueryData with Correct Dot Count',
			'queryData'
		)
	}

	// db.collection.find(_id: 1)
	// dbName = db
	// collection = collection
	// lastPart = find(_id: 1)
	// queryType = find
	// queryFilter = (_id:1)
	const [dbName, collection, lastPart] = queryData.split('.')

	const queryType = lastPart?.split('(')[0]
	const queryFilter = lastPart?.split('(')[1]?.split(')')[0]?.trim()

	ctx.state.shared.answer = {
		...sharedAnswer,
		dbName,
		collection,
		queryType,
		queryFilter,
	}

	return null
}

export const isDbNameValid = (ctx: Context) => {
	const { dbName } = ctx.state.shared.answer
	const allowedFields = ['db']

	if (!dbName || !dbName.trim()) {
		return validationError('Please Provide Database Name', 'dbName')
	}

	if (!allowedFields.includes(dbName)) {
		return validationError('Invalid Database Name', 'dbName')
	}

	return null
}

export const isCollectionValid = (ctx: Context) => {
	const { collection } = ctx.state.shared.answer
	const { validCollections } = ctx.state.shared.question

	if (!collection || !collection.trim()) {
		return validationError('Please Provide Collection Name', 'collection')
	}

	if (!validCollections.includes(collection)) {
		return validationError('Invalid Collection Name', 'collection')
	}

	return null
}

export const isQueryTypeValid = (ctx: Context) => {
	const { queryType } = ctx.state.shared.answer
	const { validQueryTypes } = ctx.state.shared.question
	const { currentlySupportedQueryTypes } = methodsOnDbCollection

	if (!queryType || !queryType.trim()) {
		return validationError('Please Provide queryType', 'queryType')
	}

	if (!currentlySupportedQueryTypes.includes(queryType)) {
		return validationError('Invalid QueryType', 'queryType')
	}

	if (!validQueryTypes.includes(queryType)) {
		return validationError(
			'This QueryType not supported in this question',
			'queryType'
		)
	}

	return null
}

export const isQueryFilterValid = (ctx: Context) => {
	const { queryFilter } = ctx.state.shared.answer

	if (!queryFilter || !queryFilter.trim()) {
		return validationError('Please Provide queryFilter', 'queryFilter')
	}

	const isFilterValidResponse = isFilterValid(queryFilter)

	if (!isFilterValidResponse) {
		return validationError('Invalid QueryFilter', 'queryFilter')
	}

	ctx.state.shared.answer.queryFilter = isFilterValidResponse

	return null
}
