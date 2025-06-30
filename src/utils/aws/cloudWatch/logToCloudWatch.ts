import { tryCatchSync } from 'utils/tryCatch'
import { CacheKey, sendLogToCloudWatch } from './helper'
import { getGroupAndStream } from './groupsAndStreams'
import type { GroupKey, StreamKey } from './groupsAndStreams'

interface LoggerOptions<G extends GroupKey, S extends StreamKey<G>> {
	group: G
	stream: S
	data: string | Record<string, any>
}

export const logToCloudWatch = async <
	G extends GroupKey,
	S extends StreamKey<G>,
>({
	group,
	stream,
	data,
}: LoggerOptions<G, S>) => {
	const { group: groupName, stream: streamName } = getGroupAndStream(
		group,
		stream
	)
	const cacheKey: CacheKey = `${groupName}:${streamName}`

	const [message, error] = tryCatchSync(() => {
		return typeof data === 'string' ? data : JSON.stringify(data)
	})

	if (error) {
		console.error('Failed to stringify data:', error)
		throw new Error('Failed to stringify data for logging')
	}

	const logEvent = {
		message,
		timestamp: Date.now(),
	}

	await sendLogToCloudWatch(group, stream, logEvent, cacheKey, true)
}
