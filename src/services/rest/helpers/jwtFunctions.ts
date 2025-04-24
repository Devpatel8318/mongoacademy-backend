import jwt from 'jsonwebtoken'
import config from 'config'
import { tryCatchSync } from 'utils/tryCatch'

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
	const [decoded, error] = tryCatchSync(() => {
		return jwt.verify(token, secret)
	})

	if (error) return false

	return decoded
}
