import awsConfig from './aws.config'
import encryptDecryptConfig from './encryptDecrypt.config'
import cookieConfig from './cookie.config'
import jwtConfig from './jwt.config'
import mongodbConfig from './mongodb.config'

const data = {
	common: {
		PORT: parseInt(process.env.BACKEND_PORT || '8000'),
		ADMIN_FRONTEND_URL: process.env.ADMIN_FRONTEND_URL || '',
		USER_FRONTEND_URL: process.env.USER_FRONTEND_URL || '',
		checkExecutionTime: true,
	},
	mongoDB: mongodbConfig,
	cookie: cookieConfig,
	jwt: jwtConfig,
	aws: awsConfig,
	encryptDecrypt: encryptDecryptConfig,
}
export default data
