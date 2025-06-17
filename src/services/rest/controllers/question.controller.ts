import { Context } from 'deps'
import { successObject } from 'utils/responseObject'
import * as questionQueries from 'queries/questions'
import * as questionProgressQueries from 'queries/questionProgress'
import { getDataFromRedis, setDataInRedis } from 'redisQueries'
import concurrently from 'utils/concurrently'
import getMd5Hash from 'utils/getMd5Hash'
import getDbQueryPromise, {
	DatabaseSchemaQueryType,
} from '../helpers/getDbQueryPromise'
import * as bookmarkQueries from 'queries/bookmark'
import { QuestionProgressEnum } from 'Types/enums'
import MongoDbReadOnlyConnection from 'MongoDbReadOnlyConnection'

export const getAllQuestions = async (ctx: Context) => {
	const { filterObject, user } = ctx.state.shared
	const { filter, sort, skip, limit, progressFilter, onlyBookmarked } =
		filterObject
	const { userId } = user

	const questionsData =
		await questionQueries.fetchAllQuestionsAndCountWithDifficultyLabel({
			filter,
			sort,
			skip,
			limit,
			projection: {
				question: 1,
				progress: 1,
				difficulty: 1,
				questionId: 1,
			},
			userId,
			onlyBookmarked,
			progressFilter,
		})

	const firstResult = questionsData[0] || { data: [], totalCount: [] }
	const { data, totalCount } = firstResult

	const responseObject = {
		list: data,
		total: totalCount?.[0]?.total,
	}

	ctx.body = successObject('', responseObject)
}

export const getSolution = async (ctx: Context) => {
	const { questionId, answer } = ctx.state.shared.question
	const { userId } = ctx.state.shared.user

	await questionProgressQueries.updateOneQuestionProgress(
		{ userId, questionId: +questionId },
		{
			$setOnInsert: {
				progress: QuestionProgressEnum.TODO,
				userId,
				questionId: +questionId,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
			$set: {
				isSolutionSeen: true,
				solutionSeenAt: new Date(),
				updatedAt: new Date(),
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
				console.log({ query })
				const dbExecutionPromise = getDbQueryPromise(
					MongoDbReadOnlyConnection,
					query
				)
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
