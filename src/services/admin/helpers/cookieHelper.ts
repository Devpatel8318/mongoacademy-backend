type SameSiteOption = 'strict' | 'lax' | 'none' | boolean

export const getCookieParameters = (
	maxAge: number,
	path = '/',
	httpOnly = true,
	secure = false, // TODO: Change to true in non-local environment
	sameSite: SameSiteOption = 'strict', // TODO: Change to 'none' in non-local environment
	overwrite = true
) => ({
	maxAge,
	path,
	httpOnly,
	secure,
	sameSite,
	overwrite,
})
