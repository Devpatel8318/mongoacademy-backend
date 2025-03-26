import jwt from 'jsonwebtoken'
import config from 'config'

const secret = config.jwt.SECRET

export const generateAuthToken = (
	expiresIn: string,
	payload: object
): string => {
	return jwt.sign(payload, secret, {
		expiresIn,
		algorithm: 'HS256',
	} as jwt.SignOptions)
}

export const isTokenValid = (token: string = ''): any => {
	try {
		const decoded = jwt.verify(token, secret)
		return decoded
	} catch {
		return false
	}
}
