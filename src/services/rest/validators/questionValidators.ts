import { ValidatorContext } from '../middlewares/validator'
import * as questionQueries from '../../../MongoDb/queries/questions'
import { validationError } from 'utils/responseObject'

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

	const questionData = await questionQueries.getOneQuestion(
		{
			questionId: +questionId,
		},
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
			difficultyLabel: {
				$switch: {
					branches: [
						{
							case: {
								$eq: ['$difficulty', 1],
							},
							then: 'Easy',
						},
						{
							case: {
								$eq: ['$difficulty', 5],
							},
							then: 'Medium',
						},
						{
							case: {
								$eq: ['$difficulty', 10],
							},
							then: 'Hard',
						},
					],
					default: 'UNKNOWN',
				},
			},
			dataBaseSchema: 1,
		}
	)

	if (!questionData) {
		ctx.state.continueCheckingOtherValidators = false
		return validationError('No question found with this id', 'questionId')
	}

	ctx.state.shared.question = {
		...questionData,
	}

	return null
}
