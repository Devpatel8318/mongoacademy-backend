import { Sort } from 'deps'
import { ValidatorContext } from '../middlewares/validator'
import * as questionQueries from 'queries/questions'
import { validationError } from 'utils/responseObject'
import { DifficultyEnum, QuestionProgressEnum } from 'Types/enums'

export const doesQuestionExist = async (ctx: ValidatorContext) => {
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
		await questionQueries.fetchQuestionWithDifficultyLabelAndProgressTextAndBookmark(
			{ questionId: +questionId, isDeleted: { $ne: true } },
			userId,
			{
				_id: 0,
				question: 1,
				description: 1,
				questionId: 1,
				difficulty: 1,
				progress: 1,
				answer: 1,
				collection: 1,
				queryType: 1,
				queryFilter: 1,
				chainedOps: 1,
				dataBaseSchema: 1,
				isBookmarked: 1,
				isSolutionSeen: 1,
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
	progress?: string
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
		progress = '',
		difficulty = '',
		sortBy = '_id',
		sortOrder = 'DESC',
		search = '',
		onlyBookmarked = 'false',
	}: GetAllQuestionsQueryParams = ctx.query

	const filters: Record<string, any> = { isDeleted: { $ne: true } }

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

	let progressFilter = {}
	if (progress) {
		const progressValues = progress
			.split(',')
			.map((s) => s.trim().toUpperCase())

		const validProgress = Object.values(QuestionProgressEnum)

		const hasInvalidProgress = progressValues.some(
			(s) => !validProgress.includes(s as QuestionProgressEnum)
		)

		if (hasInvalidProgress) {
			return validationError(
				'Progress must be one of TODO, ATTEMPTED, SOLVED',
				'progress'
			)
		}
		progressFilter = {
			progress: {
				$in: progressValues,
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
		progressFilter,
		onlyBookmarked: onlyBookmarkedBool,
	}

	return null
}
