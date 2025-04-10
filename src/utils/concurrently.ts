import bluebird from 'bluebird'
import config from 'config'

export default (
	list: any[],
	handler: any,
	concurrency: number = config.concurrency.defaultConcurrency
) =>
	bluebird.map(list, handler, {
		concurrency,
	})
