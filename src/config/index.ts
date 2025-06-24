import aws from './aws.config'
import encryptDecrypt from './encryptDecrypt.config'
import cookie from './cookie.config'
import jwt from './jwt.config'
import mongodb from './mongodb.config'
import google from './google.config'
import redis from './redis.config'
import concurrency from './concurrency'
import sendGrid from './sendGrid.config'

const data = {
	common: {
		PORT: parseInt(process.env.BACKEND_PORT || '8000'),
		userFrontendUrl: process.env.USER_FRONTEND_URL || '',
		checkExecutionTime: true,
		NODE_ENV: process.env.NODE_ENV || 'development',
		forgotPasswordMaxRequests: 3,
		forgotPasswordRequestTimeout: 1 * 60 * 15, // 15 minutes
	},
	mongoDB: mongodb,
	cookie: cookie,
	jwt: jwt,
	aws: aws,
	encryptDecrypt: encryptDecrypt,
	google: google,
	redis: redis,
	concurrency: concurrency,
	sendGrid,
}
export default data
