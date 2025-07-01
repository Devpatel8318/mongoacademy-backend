import { Context, isFilterValid, Next } from 'deps'
import extractPartsFromQuery from '../helpers/extractPartsFromQuery'
import { logToCloudWatch } from 'utils/aws/cloudWatch/logToCloudWatch'

const extractQueryPartsFromQuestion = async (ctx: Context, next: Next) => {
	const { question } = ctx.state.shared
	const { answer, questionId } = question

	let {
		errorMessage,
		collection,
		queryType,
		queryFilter,
		queryUpdate,
		queryOptions,
		chainedOps,
	} = extractPartsFromQuery(answer)

	if (errorMessage) {
		console.error('Error extracting query parts', {
			questionId,
			errorMessage,
		})
		ctx.state.continueCheckingOtherValidators = false
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				message: 'Error extracting query parts',
				questionId,
				error: errorMessage,
			},
		})
		ctx.throw()
	}

	try {
		if (!queryFilter) throw new Error('Query filter is missing')
		queryFilter = isFilterValid(queryFilter)

		queryUpdate = queryUpdate && isFilterValid(queryUpdate)
		queryOptions = queryOptions && isFilterValid(queryOptions)
	} catch (error) {
		console.error('Error parsing JSON from query parts:', {
			questionId,
			error,
		})
		ctx.state.continueCheckingOtherValidators = false
		await logToCloudWatch({
			group: 'BACKEND',
			stream: 'REST',
			data: {
				type: 'error',
				message: 'Error parsing JSON from query parts',
				questionId,
				error: errorMessage,
			},
		})
		ctx.throw()
	}

	ctx.state.shared.question = {
		...ctx.state.shared.question,
		correctQuery: answer,
		correctCollection: collection,
		correctQueryType: queryType,
		correctQueryFilter: queryFilter,
		correctQueryUpdate: queryUpdate,
		correctQueryOptions: queryOptions,
		correctChainedOps: chainedOps,
	}

	return next()
}

export default extractQueryPartsFromQuestion
