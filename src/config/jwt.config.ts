export default {
	SECRET: process.env.JWT_SECRET || 'defaultSecret',
	ISSUER: process.env.JWT_ISSUER || '',
}
