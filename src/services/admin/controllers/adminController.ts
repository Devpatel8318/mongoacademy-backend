import config from 'config'
import { Context, Sort } from 'deps'
import * as questionQueries from 'queries/questions'
import { successObject } from 'utils/responseObject'
import { generateAuthToken } from '../helpers/jwtFunctions'
import { getCookieParameters } from '../helpers/cookieHelper'

export const loginAdmin = async (ctx: Context) => {
	try {
		const jwtTokenAccessToken = generateAuthToken('60m')
		ctx.cookies.set(
			config.cookie.ADMIN_ACCESS_TOKEN_COOKIE_NAME,
			jwtTokenAccessToken,
			getCookieParameters(
				60 * 60 // 60 minutes
			)
		)
		const jwtTokenRefreshToken = generateAuthToken('30d')
		ctx.cookies.set(
			config.cookie.REFRESH_TOKEN_COOKIE_NAME,
			jwtTokenRefreshToken,
			getCookieParameters(
				60 * 60 * 24 * 30, // 30 days
				'/admin/refresh'
			)
		)
	} catch {
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

	const filters: Record<string, any> = {}

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
	const response = await questionQueries.getAllQuestions({
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

	const count = await questionQueries.getQuestionsCount()

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
	try {
		const jwtTokenAccessToken = generateAuthToken('60m')

		ctx.cookies.set(
			config.cookie.ADMIN_ACCESS_TOKEN_COOKIE_NAME,
			jwtTokenAccessToken,
			getCookieParameters(
				60 * 60 * 1000 // 60 minutes
			)
		)
	} catch {
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
