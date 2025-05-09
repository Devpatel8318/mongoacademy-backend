import { ValidatorContext } from '../middlewares/validator'
import * as questionQueries from 'queries/questions'
import { validationError } from 'utils/responseObject'

export const isQuestionIdValid = async (ctx: ValidatorContext) => {
	const { userId } = ctx.state.shared.user

	if (!Object.prototype.hasOwnProperty.call(ctx, 'params')) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('Please provide Question Id', 'questionId')
	}

	const { questionId } = ctx.params

	if (!questionId || isNaN(+questionId)) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('Invalid Question Id', 'questionId')
	}

	const questionData =
		await questionQueries.fetchQuestionWithDifficultyLabelAndStatusTextAndBookmark(
			{ questionId: +questionId },
			userId,
			{
				_id: 0,
				question: 1,
				description: 1,
				questionId: 1,
				difficulty: 1,
				status: 1,
				answer: 1,
				validCollections: 1,
				collection: 1,
				queryType: 1,
				queryFilter: 1,
				chainedOps: 1,
				dataBaseSchema: 1,
				isBookmarked: 1,
			}
		)

	if (!questionData || !questionData.length || !questionData[0]) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('No question found with this id', 'questionId')
	}

	ctx.state.shared.question = {
		...questionData[0],
	}

	return null
}
