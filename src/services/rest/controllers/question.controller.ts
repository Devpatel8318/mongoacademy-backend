import { Context } from 'deps'
import { successObject } from 'utils/responseObject'
import * as questionQueries from 'queries/questions'
import * as statusQueries from 'queries/status'
import { getDataFromRedis, setDataInRedis } from 'redisQueries'
import concurrently from 'utils/concurrently'
import getMd5Hash from 'utils/getMd5Hash'
import getDbQueryPromise, {
	DatabaseSchemaQueryType,
} from '../helpers/getDbQueryPromise'
import * as bookmarkQueries from 'queries/bookmark'
import { QuestionStatusEnum } from 'Types/enums'

export const getAllQuestions = async (ctx: Context) => {
	const { filterObject, user } = ctx.state.shared
	const { filter, sort, skip, limit, statusFilter, onlyBookmarked } =
		filterObject
	const { userId } = user

	const redisKey = `${userId}-filter=${JSON.stringify(filter)}:sort=${JSON.stringify(
		sort
	)}:page=${skip}-${limit}`

	const redisData =
		// if user wanted bookmarked questions in that case, cached data might be old and incorrect
		!onlyBookmarked && (await getDataFromRedis(redisKey))

	let questionsData = redisData

	if (redisData) {
		questionsData = redisData
	} else {
		questionsData =
			await questionQueries.fetchAllQuestionsAndCountWithDifficultyLabel({
				filter,
				sort,
				skip,
				limit,
				projection: {
					question: 1,
					status: 1,
					difficulty: 1,
					questionId: 1,
				},
				userId,
				onlyBookmarked,
				statusFilter,
			})

		await setDataInRedis(redisKey, questionsData, 60 * 60)
	}

	const { data, totalCount } = questionsData[0]

	const responseObject = {
		list: data,
		total: totalCount?.[0]?.total,
	}

	ctx.body = successObject('', responseObject)
}

export const getSolution = async (ctx: Context) => {
	const { questionId, answer } = ctx.state.shared.question
	const { userId } = ctx.state.shared.user

	await statusQueries.updateOneStatus(
		{ userId, questionId: +questionId },
		{
			$setOnInsert: {
				status: QuestionStatusEnum.TODO,
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
		await bookmarkQueries.deleteOneBookmark(userId, +questionId)
	} else {
		await bookmarkQueries.insertOneBookmark(userId, +questionId)
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
