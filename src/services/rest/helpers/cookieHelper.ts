import config from 'config'
import { Context } from 'deps'
import { generateAuthToken } from 'services/rest/helpers/jwtFunctions'

type SameSiteOption = 'strict' | 'lax' | 'none' | boolean

export const getCookieParameters = (
	maxAge: number,
	path = '/',
	httpOnly = true,
	secure = config.common.NODE_ENV === 'production', // TODO: Change to true in non-local environment
	sameSite: SameSiteOption = config.common.NODE_ENV === 'production' // TODO: Change to 'none' in non-local environment
		? 'none'
		: 'strict',
	overwrite = true
) => ({
	maxAge,
	path,
	httpOnly,
	secure,
	sameSite,
	overwrite,
})

interface SetAccessTokenCookieProps {
	ctx: Context
	data: Object
	maxAge?: number
	path?: string
}

export const setAccessTokenCookie = async ({
	ctx,
	data,
	maxAge = 1000 * 60 * 60, // 60 minutes,
	path = '/',
}: SetAccessTokenCookieProps) => {
	const jwtTokenAccessToken = generateAuthToken('60m', data)

	ctx.cookies.set(
		config.cookie.ACCESS_TOKEN_COOKIE_NAME,
		jwtTokenAccessToken,
		getCookieParameters(maxAge, path)
	)
}

export const setRefreshTokenCookie = async ({
	ctx,
	data,
	maxAge = 1000 * 60 * 60 * 24 * 30, // 30 days
	path = '/auth/refresh',
}: SetAccessTokenCookieProps) => {
	const jwtTokenRefreshToken = generateAuthToken('30d', data)

	ctx.cookies.set(
		config.cookie.REFRESH_TOKEN_COOKIE_NAME,
		jwtTokenRefreshToken,
		getCookieParameters(maxAge, path)
	)
}

export const setAuthCookies = async (
	ctx: Context,
	data: Object,
	maxAge?: number,
	path?: string
) => {
	const parameters = {
		ctx,
		data,
		...(maxAge && { maxAge }),
		...(path && { path }),
	}

	setAccessTokenCookie(parameters)
	setRefreshTokenCookie(parameters)
}
