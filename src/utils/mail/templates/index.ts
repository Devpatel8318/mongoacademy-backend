import forgotPasswordTemplate from './forgotPasswordTemplate'

export const EMAIL_TYPES = {
	FORGOT_PASSWORD: 'forgotPassword',
} as const

export const templateMapper = {
	[EMAIL_TYPES.FORGOT_PASSWORD]: forgotPasswordTemplate,
}
