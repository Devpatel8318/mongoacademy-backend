import crypto from 'crypto'

const SALT_LENGTH = 16
const IV_LENGTH = 12
const KEY_ITERATIONS = 100000
const KEY_LENGTH = 32 // 256-bit key
const ALGORITHM = 'aes-256-gcm'

const getEncryptionKey = (): string => {
	const key = process.env.ENCRYPTION_KEY
	if (!key) {
		throw new Error('ENCRYPTION_KEY environment variable is not set')
	}
	return key
}

const deriveKey = async (
	salt?: Buffer
): Promise<{ key: Buffer; salt: Buffer }> => {
	const encryptionKey = Buffer.from(getEncryptionKey(), 'utf-8')

	if (!salt) {
		salt = crypto.randomBytes(SALT_LENGTH)
	}

	const key = crypto.pbkdf2Sync(
		encryptionKey,
		salt,
		KEY_ITERATIONS,
		KEY_LENGTH,
		'sha256'
	)
	return { key, salt }
}

export const encrypt = async (text: string): Promise<string> => {
	if (!text || typeof text !== 'string' || !text.trim()) {
		throw new Error('Text cannot be empty.')
	}

	const { key, salt } = await deriveKey()
	const iv = crypto.randomBytes(IV_LENGTH)
	const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

	const encrypted = Buffer.concat([
		cipher.update(text, 'utf-8'),
		cipher.final(),
	])
	const combinedData = Buffer.concat([salt, iv, encrypted])

	return combinedData.toString('base64')
}

export const decrypt = async (encryptedText: string): Promise<string> => {
	try {
		const encryptedData = Buffer.from(encryptedText, 'base64')
		const salt = encryptedData.slice(0, SALT_LENGTH)
		const iv = encryptedData.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
		const cipherText = encryptedData.slice(SALT_LENGTH + IV_LENGTH)

		const { key } = await deriveKey(salt)
		const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)

		const decrypted = Buffer.concat([
			decipher.update(cipherText),
			decipher.final(),
		])
		return decrypted.toString('utf-8')
	} catch (error) {
		console.error('Decryption error:', error)
		throw new Error('Decryption failed. Invalid key or corrupted data.')
	}
}
