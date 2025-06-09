import { Sort } from 'deps'
import { ValidatorContext } from '../middlewares/validator'
import * as questionQueries from 'queries/questions'
import { validationError } from 'utils/responseObject'
import { DifficultyEnum, QuestionStatusEnum } from 'Types/enums'

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

interface GetAllQuestionsQueryParams {
	limit?: string
	page?: string
	status?: string
	difficulty?: string
	sortBy?: string
	sortOrder?: string
	search?: string
	onlyBookmarked?: string
}

export const isQuestionListQueryParamsValid = async (ctx: ValidatorContext) => {
	const {
		limit = '20',
		page = '1',
		status = '',
		difficulty = '',
		sortBy = '_id',
		sortOrder = 'DESC',
		search = '',
		onlyBookmarked = 'false',
	}: GetAllQuestionsQueryParams = ctx.query

	const filters: Record<string, any> = {}

	const limitNum = parseInt(limit, 10)
	if (isNaN(limitNum) || limitNum < 1 || limitNum > 500) {
		return validationError(
			'Limit must be a number between 1 and 500',
			'limit'
		)
	}

	const pageNum = parseInt(page, 10)
	if (isNaN(pageNum) || pageNum < 1) {
		return validationError('Page must be a valid positive number', 'page')
	}

	const skip = (pageNum - 1) * limitNum

	const normalizedSortOrder = sortOrder.toUpperCase()
	if (!['ASC', 'DESC'].includes(normalizedSortOrder)) {
		return validationError(
			'Sort Order must be either ASC or DESC',
			'sortOrder'
		)
	}
	const sort: Sort = { [sortBy]: normalizedSortOrder === 'ASC' ? 1 : -1 }

	if (search && typeof search === 'string') {
		const trimmedSearch = search.trim()
		if (trimmedSearch.length > 0 && trimmedSearch.length < 3) {
			return validationError(
				'Search must be at least 3 characters long',
				'search'
			)
		}
		filters.question = { $regex: trimmedSearch, $options: 'i' }
	}

	let statusFilter = {}
	if (status) {
		const statusValues = status
			.split(',')
			.map((s) => s.trim().toUpperCase())

		const validStatuses = Object.values(QuestionStatusEnum)

		const hasInvalidStatus = statusValues.some(
			(s) => !validStatuses.includes(s as QuestionStatusEnum)
		)

		if (hasInvalidStatus) {
			return validationError(
				'Status must be one of TODO, ATTEMPTED, SOLVED',
				'status'
			)
		}
		statusFilter = {
			status: {
				$in: statusValues,
			},
		}
	}

	if (difficulty) {
		const difficultyValues = difficulty
			.split(',')
			.map((d) => d.trim().toUpperCase())

		const validDifficulties = Object.values(DifficultyEnum)

		const hasInvalid = difficultyValues.some(
			(d) => !validDifficulties.includes(d as DifficultyEnum)
		)

		if (hasInvalid) {
			return validationError(
				'Difficulty must be one of EASY, MEDIUM, HARD',
				'difficulty'
			)
		}
		filters.difficulty = {
			$in: difficultyValues,
		}
	}

	const onlyBookmarkedBool = onlyBookmarked === 'true'
	if (!['true', 'false'].includes(onlyBookmarked)) {
		return validationError(
			'Only Bookmarked must be either true or false',
			'onlyBookmarked'
		)
	}

	// Attach to context
	ctx.state.shared.filterObject = {
		filter: filters,
		sort,
		skip,
		limit: limitNum,
		statusFilter,
		onlyBookmarked: onlyBookmarkedBool,
	}

	return null
}
