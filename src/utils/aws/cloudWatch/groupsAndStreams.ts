import config from 'config'

export const GROUPS = {
	BACKEND: 'backend',
	LAMBDAS: 'lambdas',
} as const

export const STREAMS = {
	BACKEND: {
		REST: 'rest',
	},
	LAMBDAS: {
		API: 'api',
	},
} as const

export type GroupKey = keyof typeof GROUPS
export type StreamKey<G extends GroupKey> = keyof (typeof STREAMS)[G]

export const getGroupAndStream = <G extends GroupKey, S extends StreamKey<G>>(
	group: G,
	stream: S
) => {
	const groupName = GROUPS[group]
	const streamName = `${STREAMS[group][stream]}-${config.common.NODE_ENV}`

	return {
		group: groupName,
		stream: streamName,
	}
}
export default getGroupAndStream
