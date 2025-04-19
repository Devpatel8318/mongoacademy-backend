import { Status } from 'Types/global'
import { Context, Sort } from 'deps'
import { successObject } from 'utils/responseObject'
import * as questionQueries from 'queries/questions'
import * as statusQueries from 'queries/status'
import { getDataFromRedis, setDataInRedis } from 'utils/redis/redis'
import concurrently from 'utils/concurrently'
import getMd5Hash from 'utils/getMd5Hash'
import getDbQueryPromise, {
	DatabaseSchemaQueryType,
} from '../helpers/getDbQueryPromise'
import * as bookmarkQueries from 'queries/bookmark'

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

export const getAllQuestions = async (ctx: Context) => {
	const { userId } = ctx.state.shared.user
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

	const limitNum = Number(limit)
	const pageNum = Number(page)
	const sortOrderNum = sortOrder === 'ASC' ? 1 : -1

	const filters: Record<string, any> = {}

	if (search) {
		filters.question = { $regex: search, $options: 'i' }
	}

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

	const onlyBookmarkedBool = onlyBookmarked === 'true'

	const redisKey = `${userId}-filter=${JSON.stringify(filters)}:sort=${JSON.stringify(
		sort
	)}:page=${skip}-${limitNum}:onlyBookmarked=${onlyBookmarkedBool}`

	const redisData =
		// if user wanted bookmarked questions in that case, cached data might be old and incorrect
		!onlyBookmarkedBool && (await getDataFromRedis(redisKey))

	let questionsData

	if (redisData) {
		questionsData = redisData
	} else {
		questionsData =
			await questionQueries.fetchAllQuestionsAndCountWithDifficultyLabel({
				filter: filters,
				sort,
				skip,
				limit: limitNum,
				projection: {
					question: 1,
					status: 1,
					difficulty: 1,
					questionId: 1,
				},
				userId,
				onlyBookmarked: onlyBookmarkedBool,
			})

		await setDataInRedis(redisKey, questionsData, 60 * 60)
	}

	const { data, totalCount } = questionsData[0] || {}

	const responseObject = {
		total: totalCount?.[0]?.total || 0,
	}

	const questionIds = data.map((item: any) => item.questionId)

	const statuses = await statusQueries.fetchStatuses({
		userId,
		questionId: { $in: questionIds },
	})

	const STATUS_TEXTS = {
		1: 'TODO',
		2: 'ATTEMPTED',
		3: 'SOLVED',
	}

	const statusMap = statuses.reduce((acc: Record<string, any>, item: any) => {
		const { questionId, status } = item as {
			questionId: number
			status: Status
		}
		acc[questionId] = STATUS_TEXTS[status] || 'TODO'
		return acc
	}, {})

	Object.assign(responseObject, {
		list: data.map((item: any) => ({
			...item,
			status: statusMap[item.questionId] || 'TODO',
		})),
	})

	ctx.body = successObject('', responseObject)
}

export const getSolution = async (ctx: Context) => {
	const { questionId, answer } = ctx.state.shared.question
	const { userId } = ctx.state.shared.user

	await statusQueries.updateOneStatus(
		{ userId, questionId: +questionId },
		{
			$setOnInsert: {
				status: 1,
				userId,
				questionId: +questionId,
			},
			$set: {
				isSolutionSeen: true,
				solutionSeenAt: Date.now(),
			},
		},
		{ upsert: true }
	)

	ctx.body = successObject('', {
		questionId,
		answer,
	})
}

export interface SingleDataBaseSchema {
	title: string
	query: DatabaseSchemaQueryType
}

export const viewQuestion = async (ctx: Context) => {
	const questionData = ctx.state.shared.question

	const { questionId, dataBaseSchema } = questionData as {
		questionId: number
		dataBaseSchema: SingleDataBaseSchema[]
	}

	const schemaResponses: { title: string; schema: any }[] = []

	await concurrently(
		dataBaseSchema,
		async (schemaItem: SingleDataBaseSchema) => {
			const { title, query } = schemaItem
			let schemaResult

			const cacheKey = `questionId=${questionId}-${getMd5Hash(`title=${title}:query=${JSON.stringify(query)}`)}`
			const cachedSchema = await getDataFromRedis(cacheKey)

			if (cachedSchema) {
				schemaResult = cachedSchema
			} else {
				const dbExecutionPromise = getDbQueryPromise(query)
				const fetchedSchema = await dbExecutionPromise

				await setDataInRedis(
					cacheKey,
					fetchedSchema,
					1 * 60 * 60 * 24 // 1 day
				)
				schemaResult = fetchedSchema
			}

			schemaResponses.push({ title, schema: schemaResult })
		}
	)

	ctx.body = successObject('Question data displayed successfully.', {
		...questionData,
		dataBaseSchema: schemaResponses,
	})
}

export const bookmarkQuestion = async (ctx: Context) => {
	const { questionId } = ctx.state.shared.question
	const { userId } = ctx.state.shared.user

	const isBookmarked = await bookmarkQueries.fetchOneBookmark(
		userId,
		+questionId
	)

	if (isBookmarked) {
		bookmarkQueries.deleteOneBookmark(userId, +questionId)
	} else {
		bookmarkQueries.insertOneBookmark(userId, +questionId)
	}

	ctx.body = successObject(
		isBookmarked
			? 'Bookmark removed successfully.'
			: 'Bookmark added successfully.',
		{
			questionId,
			isBookmarked: !isBookmarked,
		}
	)
}
