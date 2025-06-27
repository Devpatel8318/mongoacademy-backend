import { Sort } from 'deps'
import mongoDB from 'MongoDbConnection'

const collectionName = 'questions'

type getAllQuestionsParams = {
	filter?: Object
	projection?: Record<string, number>
	skip?: number
	limit?: number
	sort?: Sort
	userId: number
	onlyBookmarked?: boolean
	progressFilter?: Object
}

export const fetchAllQuestions = async ({
	filter = {},
	projection = {},
	skip = 0,
	limit = 20,
	sort = { _id: -1 },
	userId = 0,
}: getAllQuestionsParams) => {
	return await mongoDB
		.collection(collectionName)
		.aggregate([
			{ $match: filter },
			{
				$lookup: {
					from: 'questionProgress',
					localField: 'questionId',
					foreignField: 'questionId',
					pipeline: [{ $match: { userId } }],
					as: 'result',
				},
			},
			{
				$addFields: {
					progress: {
						$ifNull: [
							{
								$first: '$result.progress',
							},
							'TODO',
						],
					},
				},
			},
			{ $sort: sort },
			{ $skip: skip },
			{ $limit: limit },
			{
				$project: {
					...projection,
					progress: {
						$switch: {
							branches: [
								{
									case: { $eq: ['$progress', 1] },
									then: 'TODO',
								},
								{
									case: { $eq: ['$progress', 2] },
									then: 'ATTEMPTED',
								},
								{
									case: { $eq: ['$progress', 3] },
									then: 'SOLVED',
								},
							],
							default: 'TODO',
						},
					},
				},
			},
		])
		.toArray()
}

export const fetchAllQuestionsAndCountWithDifficultyLabel = async ({
	filter = {},
	projection = {},
	skip = 0,
	limit = 20,
	sort = { _id: 1 },
	onlyBookmarked,
	userId,
	progressFilter = {},
}: getAllQuestionsParams) => {
	const pipeline = [
		{ $match: filter },
		{
			$lookup: {
				from: 'questionProgress',
				localField: 'questionId',
				foreignField: 'questionId',
				pipeline: [{ $match: { userId } }],
				as: 'result',
			},
		},
		{
			$addFields: {
				progress: {
					$ifNull: [
						{
							$first: '$result.progress',
						},
						'TODO',
					],
				},
			},
		},
		...(progressFilter && Object.keys(progressFilter).length > 0
			? [
					{
						$match: progressFilter,
					},
				]
			: []),
		...(onlyBookmarked
			? [
					{
						$lookup: {
							from: 'bookmark',
							localField: 'questionId',
							foreignField: 'questionId',
							pipeline: [{ $match: { userId } }],
							as: 'bookmarkResult',
						},
					},
					{
						$unwind: {
							path: '$bookmarkResult',
						},
					},
				]
			: []),
		{ $sort: sort },
		{
			$facet: {
				data: [
					{ $skip: skip },
					{ $limit: limit },
					{
						$project: projection,
					},
				],
				totalCount: [{ $count: 'total' }],
			},
		},
	]

	return await mongoDB
		.collection(collectionName)
		.aggregate(pipeline)
		.toArray()
}

export const fetchQuestionsCount = async (filter = {}) =>
	await mongoDB.collection(collectionName).countDocuments(filter)

export const fetchOneQuestion = async (filter = {}, projection = {}) =>
	await mongoDB.collection(collectionName).findOne(filter, { projection })

export const fetchQuestionWithDifficultyLabelAndProgressTextAndBookmark =
	async (filter = {}, userId: number, projection = {}) => {
		const pipeline = [
			{ $match: filter },
			{
				$lookup: {
					from: 'questionProgress',
					localField: 'questionId',
					foreignField: 'questionId',
					pipeline: [{ $match: { userId } }],
					as: 'result',
				},
			},
			{
				$addFields: {
					progress: {
						$ifNull: [
							{
								$first: '$result.progress',
							},
							'TODO',
						],
					},
					isSolutionSeen: {
						$ifNull: [
							{
								$first: '$result.isSolutionSeen',
							},
							false,
						],
					},
				},
			},
			{
				$lookup: {
					from: 'bookmark',
					localField: 'questionId',
					foreignField: 'questionId',
					pipeline: [{ $match: { userId } }],
					as: 'bookmarkResult',
				},
			},
			{
				$addFields: {
					isBookmarked: {
						$gt: [{ $size: '$bookmarkResult' }, 0],
					},
				},
			},
			{
				$project: projection,
			},
		]

		return await mongoDB
			.collection(collectionName)
			.aggregate(pipeline)
			.toArray()
	}
