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
}

export const getAllQuestions = async ({
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
				},
			},
		])
		.toArray()
}

export const getAllQuestionsAndCount = async ({
	filter = {},
	projection = {},
	skip = 0,
	limit = 20,
	sort = { _id: -1 },
	userId = 0,
}: getAllQuestionsParams) => {
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
						'TODO',
					],
				},
			},
		},
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
	console.dir(pipeline, { depth: null })
	return await mongoDB
		.collection(collectionName)
		.aggregate(pipeline)
		.toArray()
}

export const getQuestionsCount = async (filter = {}) =>
	await mongoDB.collection(collectionName).countDocuments(filter)

export const getOneQuestion = async (filter = {}, projection = {}) =>
	await mongoDB.collection(collectionName).findOne(filter, { projection })
