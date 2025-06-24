import { bcrypt } from 'deps'

const SALT_ROUNDS = 12

export const hashData = async (data: string): Promise<string> => {
	return await bcrypt.hash(data, SALT_ROUNDS)
}

export const verifyHash = async (
	data: string,
	hashedData: string
): Promise<boolean> => {
	return await bcrypt.compare(data, hashedData)
}
