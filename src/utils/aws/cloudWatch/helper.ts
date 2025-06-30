import {
	CloudWatchLogsClient,
	PutLogEventsCommand,
	CreateLogGroupCommand,
	CreateLogStreamCommand,
	DescribeLogStreamsCommand,
	PutRetentionPolicyCommand,
} from '@aws-sdk/client-cloudwatch-logs'

import { tryCatch } from 'utils/tryCatch'
import { getGroupAndStream } from './groupsAndStreams'
import type { GroupKey, StreamKey } from './groupsAndStreams'

const cloudwatch = new CloudWatchLogsClient({ region: 'ap-south-1' })

export type CacheKey = `${string}:${string}`
const tokenCache: Record<CacheKey, string | undefined> = {}

const createResources = async <G extends GroupKey, S extends StreamKey<G>>(
	group: G,
	stream: S,
	cacheKey: CacheKey
) => {
	const { group: groupName, stream: streamName } = getGroupAndStream(
		group,
		stream
	)

	const [, logGroupError] = await tryCatch(
		cloudwatch.send(new CreateLogGroupCommand({ logGroupName: groupName }))
	)

	if (
		logGroupError &&
		logGroupError.name !== 'ResourceAlreadyExistsException'
	) {
		throw logGroupError
	}

	const [, logStreamError] = await tryCatch(
		cloudwatch.send(
			new CreateLogStreamCommand({
				logGroupName: groupName,
				logStreamName: streamName,
			})
		)
	)

	if (
		logStreamError &&
		logStreamError.name !== 'ResourceAlreadyExistsException'
	) {
		throw logStreamError
	}

	await cloudwatch.send(
		new PutRetentionPolicyCommand({
			logGroupName: groupName,
			retentionInDays: 14,
		})
	)

	// Update sequence token
	const describe = await cloudwatch.send(
		new DescribeLogStreamsCommand({
			logGroupName: groupName,
			logStreamNamePrefix: streamName,
		})
	)

	tokenCache[cacheKey] = describe.logStreams?.[0]?.uploadSequenceToken
}

export const sendLogToCloudWatch = async <
	G extends GroupKey,
	S extends StreamKey<G>,
>(
	group: G,
	stream: S,
	logEvent: { message: string; timestamp: number },
	cacheKey: CacheKey,
	retry = true
): Promise<void> => {
	const { group: groupName, stream: streamName } = getGroupAndStream(
		group,
		stream
	)

	const [sendResponse, sendError] = await tryCatch(
		cloudwatch.send(
			new PutLogEventsCommand({
				logGroupName: groupName,
				logStreamName: streamName,
				logEvents: [logEvent],
				sequenceToken: tokenCache[cacheKey],
			})
		)
	)

	if (sendError) {
		if (sendError.name === 'InvalidSequenceTokenException') {
			const expectedToken = sendError.message?.match(
				/sequenceToken is: (\w+)/
			)?.[1]
			if (expectedToken) {
				tokenCache[cacheKey] = expectedToken
				return await sendLogToCloudWatch(
					group,
					stream,
					logEvent,
					cacheKey,
					false
				)
			}
		}

		if (
			retry &&
			(sendError.name === 'ResourceNotFoundException' ||
				sendError.message?.includes('log group') ||
				sendError.message?.includes('log stream'))
		) {
			await createResources(group, stream, cacheKey)
			return await sendLogToCloudWatch(
				group,
				stream,
				logEvent,
				cacheKey,
				false
			)
		}

		throw sendError
	}

	tokenCache[cacheKey] = sendResponse.nextSequenceToken
}
