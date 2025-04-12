import { Sort } from 'deps'
import mongoDB from '../connection'

const collectionName = 'questions'

type getAllQuestionsParams = {
	filter?: Object
	projection?: Record<string, number>
	skip?: number
	limit?: number
	sort?: Sort
	userId: number
	onlyBookmarked?: boolean
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
					from: 'status',
					localField: 'questionId',
					foreignField: 'questionId',
					pipeline: [{ $match: { userId } }],
					as: 'result',
				},
			},
			{
				$addFields: {
					status: {
						$ifNull: [
							{
								$first: '$result.status',
							},
							1,
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
					difficultyLabel: {
						$switch: {
							branches: [
								{
									case: { $eq: ['$difficulty', 1] },
									then: 'Easy',
								},
								{
									case: { $eq: ['$difficulty', 5] },
									then: 'Medium',
								},
								{
									case: { $eq: ['$difficulty', 10] },
									then: 'Hard',
								},
							],
							default: 'UNKNOWN',
						},
					},
					status: {
						$switch: {
							branches: [
								{
									case: { $eq: ['$status', 1] },
									then: 'TODO',
								},
								{
									case: { $eq: ['$status', 2] },
									then: 'ATTEMPTED',
								},
								{
									case: { $eq: ['$status', 3] },
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
	sort = { _id: -1 },
	onlyBookmarked,
}: getAllQuestionsParams) => {
	const pipeline = [
		{ $match: filter },
		...(onlyBookmarked
			? [
					{
						$lookup: {
							from: 'bookmark',
							localField: 'questionId',
							foreignField: 'questionId',
							pipeline: [{ $match: { userId: 3 } }],
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
						$project: {
							...projection,
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
						},
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

export const fetchQuestionWithDifficultyLabelAndStatusTextAndBookmark = async (
	filter = {},
	userId: number,
	projection = {}
) => {
	const pipeline = [
		{ $match: filter },
		{
			$lookup: {
				from: 'status',
				localField: 'questionId',
				foreignField: 'questionId',
				pipeline: [{ $match: { userId } }],
				as: 'result',
			},
		},
		{
			$addFields: {
				status: {
					$ifNull: [
						{
							$first: '$result.status',
						},
						1,
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
			$project: {
				...projection,
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
				status: {
					$switch: {
						branches: [
							{
								case: { $eq: ['$status', 1] },
								then: 'TODO',
							},
							{
								case: { $eq: ['$status', 2] },
								then: 'ATTEMPTED',
							},
							{
								case: { $eq: ['$status', 3] },
								then: 'SOLVED',
							},
						],
						default: 'TODO',
					},
				},
			},
		},
	]

	return await mongoDB
		.collection(collectionName)
		.aggregate(pipeline)
		.toArray()
}
