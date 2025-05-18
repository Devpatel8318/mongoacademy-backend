import jwt from 'jsonwebtoken'
import config from 'config'
import { tryCatchSync } from 'utils/tryCatch'

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
	const [, error] = tryCatchSync(() => {
		jwt.verify(token, secret)
	})

	return !error
}
