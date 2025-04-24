// Import necessary modules
import config from 'config'
import { MessageAttributeValue, SendMessageCommand, SQSClient } from 'deps'
import { tryCatch } from 'utils/tryCatch'

// Initialize the SQS client once, outside of any function
const sqsClient = new SQSClient(config.aws.sqs)

async function pushMessageInSqs(
	queueUrl: string,
	messageBody: Record<string, unknown>,
	MessageAttributes: Record<string, MessageAttributeValue> = {}
) {
	const [result, error] = await tryCatch(async () => {
		const params = {
			QueueUrl: queueUrl,
			MessageBody: JSON.stringify(messageBody),
			MessageAttributes: MessageAttributes,
		}

		const command = new SendMessageCommand(params)
		return await sqsClient.send(command)
	})

	if (error) {
		console.error('Error sending message:', error)
		return
	}

	console.log('Message sent:', result.MessageId)
}

export default pushMessageInSqs
