import mongoDB from 'src/connection/MongoDb/primaryConnection'
const collectionName = 'sequenceManage'

export const getId = async (field: string): Promise<number> => {
	const sequenceData = await mongoDB
		.collection(collectionName)
		.findOneAndUpdate(
			{ id: field },
			{ $inc: { sequenceValue: 1 } },
			{ returnDocument: 'after' }
		)

	return sequenceData?.sequenceValue
}
