import * as questionQueries from '../MongoDb/queries/questions'

export default async (questionId: number, input: string) => {
	const question = await questionQueries.getOneQuestion(
		{ questionId },
		{ answer: 1, _id: 0 }
	)
	const { answer } = question?.answer || ''

	// correct response
	const correctResponse = await eval(
		"mongoDB.db('mongoDbPractice')." + answer
	)
	// input response
	const inputResponse = await eval("mongoDB.db('mongoDbPractice')." + input)

	// Compare responses
	const responsesMatch =
		JSON.stringify(correctResponse) === JSON.stringify(inputResponse)

	return responsesMatch
}
