import config from 'config'
import { Context, Sort } from 'deps'
import * as questionQueries from 'queries/questions'
import { successObject } from 'utils/responseObject'
import { generateAuthToken } from '../helpers/jwtFunctions'
import { getCookieParameters } from '../helpers/cookieHelper'
import { tryCatchSync } from 'utils/tryCatch'

export const loginAdmin = (ctx: Context) => {
	const [, error] = tryCatchSync(() => {
		const jwtTokenAccessToken = generateAuthToken('60m')
		ctx.cookies.set(
			config.cookie.ADMIN_ACCESS_TOKEN_COOKIE_NAME,
			jwtTokenAccessToken,
			getCookieParameters(
				1 * 1000 * 60 * 60 // 1 hour
			)
		)
		const jwtTokenRefreshToken = generateAuthToken('30d')
		ctx.cookies.set(
			config.cookie.REFRESH_TOKEN_COOKIE_NAME,
			jwtTokenRefreshToken,
			getCookieParameters(
				1 * 1000 * 60 * 60 * 24 * 30, // 30 days
				'/admin/refresh'
			)
		)
	})

	if (error) {
		throw new Error('Login Failed.')
	}

	ctx.body = successObject('Login Successfull.')
}

interface GetAllQuestionsQueryParams {
	limit?: string
	page?: string
	status?: string
	difficulty?: string
	sortBy?: string
	sortOrder?: string
}

export const getAllQuestions = async (ctx: Context) => {
	const {
		limit = '20',
		page = '1',
		status = '',
		difficulty = '',
		sortBy = '_id',
		sortOrder = 'DESC',
	}: GetAllQuestionsQueryParams = ctx.query

	const limitNum = Number(limit)
	const pageNum = Number(page)
	const sortOrderNum = sortOrder === 'ASC' ? 1 : -1

	const filters: Record<string, any> = { isDeleted: { $ne: true } }

	if (status) {
		filters.status = {
			$in: status.split(',').map((s) => s.toUpperCase()),
		}
	}

	if (difficulty) {
		filters.difficulty = {
			$in: difficulty.split(',').map((d) => {
				if (!isNaN(Number(d))) return Number(d)
				switch (d.toUpperCase()) {
					case 'EASY':
						return 1
					case 'MEDIUM':
						return 5
					case 'HARD':
						return 10
					default:
						return 1
				}
			}),
		}
	}

	const sort: Sort = { [sortBy]: sortOrderNum }

	const skip = (pageNum - 1) * limitNum

	// Fetch questions
	const response = await questionQueries.fetchAllQuestions({
		skip,
		limit: limitNum,
		filter: filters,
		sort,
		projection: {
			question: 1,
			status: 1,
			difficulty: 1,
			questionId: 1,
		},
		userId: ctx.state.shared.user.userId,
	})

	const count = await questionQueries.fetchQuestionsCount()

	ctx.body = successObject('Questions retrieved successfully', {
		list: response,
		total: count,
	})
}

export const getOneQuestions = async (ctx: Context) => {
	const { question } = ctx.state

	ctx.body = successObject('', question)
}

export const provideAccessToken = async (ctx: Context) => {
	const [, error] = tryCatchSync(() => {
		const jwtTokenAccessToken = generateAuthToken('60m')

		ctx.cookies.set(
			config.cookie.ADMIN_ACCESS_TOKEN_COOKIE_NAME,
			jwtTokenAccessToken,
			getCookieParameters(
				1 * 1000 * 60 * 60 // 1 hour
			)
		)
	})

	if (error) {
		throw new Error('Access Token Failed.')
	}

	ctx.body = successObject('Access Token Provided')
}

export const logoutUser = async (ctx: Context) => {
	ctx.cookies.set(
		config.cookie.ADMIN_ACCESS_TOKEN_COOKIE_NAME,
		null,
		getCookieParameters(-1)
	)
	ctx.cookies.set(
		config.cookie.REFRESH_TOKEN_COOKIE_NAME,
		null,
		getCookieParameters(-1, '/auth/refresh')
	)
	ctx.body = successObject('Logged out successfully.')
}
