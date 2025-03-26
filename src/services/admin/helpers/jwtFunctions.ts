import jwt from 'jsonwebtoken'
import config from 'config'

const secret = config.jwt.SECRET

export const generateAuthToken = (
	expiresIn: string,
	payload: object = { message: 'Authenticated' }
): string => {
	return jwt.sign(payload, secret, {
		expiresIn,
		algorithm: 'HS256',
	} as jwt.SignOptions)
}

export const isTokenValid = (token: string = ''): boolean => {
	try {
		jwt.verify(token, secret)
		return true
	} catch {
		return false
	}
}
