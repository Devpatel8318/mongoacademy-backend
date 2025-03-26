import dotenv from 'dotenv'
dotenv.config()
import awsConfig from './aws.config'

const data = {
	common: {
		PORT: parseInt(process.env.BACKEND_PORT || '8000'),
		ADMIN_FRONTEND_URL: process.env.ADMIN_FRONTEND_URL || '',
		USER_FRONTEND_URL: process.env.USER_FRONTEND_URL || '',
	},
	mongoDB: {
		URL: process.env.MONGODB_URL || '',
		DB_NAME: process.env.MONGODB_DB_NAME,
	},
	cookie: {
		ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME || '',
		REFRESH_TOKEN_COOKIE_NAME: process.env.REFRESH_TOKEN_COOKIE_NAME || '',
		ADMIN_ACCESS_TOKEN_COOKIE_NAME:
			process.env.ADMIN_ACCESS_TOKEN_COOKIE_NAME || '',
		ADMIN_REFRESH_TOKEN_COOKIE_NAME:
			process.env.ADMIN_REFRESH_TOKEN_COOKIE_NAME || '',
	},
	jwt: {
		SECRET: process.env.JWT_SECRET || 'defaultSecret',
		ISSUER: process.env.JWT_ISSUER || '',
	},
	checkExecutionTime: true,
	aws: awsConfig,
}
export default data
