import awsConfig from './aws.config'
import encryptDecryptConfig from './encryptDecrypt.config'
import cookieConfig from './cookie.config'
import jwtConfig from './jwt.config'
import mongodbConfig from './mongodb.config'
import googleConfig from './google.config'
import redisConfig from './redis.config'
import adminConfig from './admin.config'

const data = {
	common: {
		PORT: parseInt(process.env.BACKEND_PORT || '8000'),
		adminFrontendUrl: process.env.ADMIN_FRONTEND_URL || '',
		userFrontendUrl: process.env.USER_FRONTEND_URL || '',
		checkExecutionTime: true,
		NODE_ENV: process.env.NODE_ENV || 'development',
	},
	admin: adminConfig,
	mongoDB: mongodbConfig,
	cookie: cookieConfig,
	jwt: jwtConfig,
	aws: awsConfig,
	encryptDecrypt: encryptDecryptConfig,
	google: googleConfig,
	redis: redisConfig,
}
export default data
