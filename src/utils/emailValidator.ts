export const emailValidator = (email: string | undefined) => {
	if (!email || !email.trim()) {
		return 'Please enter your email'
	}

	const trimmedEmail = email.trim() as string

	const tester =
		// eslint-disable-next-line no-useless-escape
		/^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

	if (trimmedEmail.length > 254) {
		return "Email can't be longer than 254 characters"
	}

	if (!tester.test(trimmedEmail)) return 'Invalid email'

	const parts = trimmedEmail.split('@')
	if (parts.length !== 2 || parts[0]!.length > 64) return 'Invalid email'

	return false
}
