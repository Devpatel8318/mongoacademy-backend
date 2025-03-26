// Import necessary modules
import config from 'config'
import { MessageAttributeValue, SendMessageCommand, SQSClient } from 'deps'

// Initialize the SQS client once, outside of any function
const sqsClient = new SQSClient(config.aws.sqs)

async function pushMessageInSqs(
	queueUrl: string,
	messageBody: Record<string, unknown>,
	MessageAttributes: Record<string, MessageAttributeValue> = {}
) {
	try {
		const params = {
			QueueUrl: queueUrl,
			MessageBody: JSON.stringify(messageBody),
			MessageAttributes: MessageAttributes,
		}

		const command = new SendMessageCommand(params)
		const result = await sqsClient.send(command)
		console.log('Message sent:', result.MessageId)
	} catch (error) {
		console.error('Error sending message:', error)
	}
}

export default pushMessageInSqs
