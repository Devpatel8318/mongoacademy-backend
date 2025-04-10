import { Context, Sort } from 'deps'
import { successObject } from 'utils/responseObject'
import * as questionQueries from 'queries/questions'
import { getDataFromRedis, setDataInRedis } from 'utils/redis/redis'
import concurrently from 'utils/concurrently'
import getMd5Hash from 'utils/getMd5Hash'
import getDbQueryPromise, {
	DatabaseSchemaQueryType,
} from '../helpers/getDbQueryPromise'

interface GetAllQuestionsQueryParams {
	limit?: string
	page?: string
	status?: string
	difficulty?: string
	sortBy?: string
	sortOrder?: string
	search?: string
}

export const getAllQuestions = async (ctx: Context) => {
	const {
		limit = '20',
		page = '1',
		status = '',
		difficulty = '',
		sortBy = '_id',
		sortOrder = 'DESC',
		search = '',
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

	const redisKey = `filter=${JSON.stringify(filters)}:sort=${JSON.stringify(
		sort
	)}:page=${skip}-${limitNum}`

	const redisData = await getDataFromRedis(redisKey)

	if (redisData) {
		ctx.body = successObject('', redisData)
		return
	}

	const response = await questionQueries.getAllQuestionsAndCount({
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
	})

	const { data, totalCount } = response[0] || {}
	const responseObject = {
		list: data,
		total: totalCount?.[0]?.total || 0,
	}

	await setDataInRedis(redisKey, responseObject, 60 * 60)

	ctx.body = successObject('', responseObject)
}

export const getSolution = async (ctx: Context) => {
	const { questionId } = ctx.request.body as { questionId: number }

	const response = questionQueries.getAllQuestions({
		filter: { questionId },
		projection: { _id: 0 },
	})

	ctx.body = successObject('', response)
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
