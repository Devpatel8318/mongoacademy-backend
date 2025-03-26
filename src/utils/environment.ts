import config from 'config'

export const isProd = config.common.NODE_ENV === 'production'
export const isLocal = config.common.NODE_ENV !== 'production'
