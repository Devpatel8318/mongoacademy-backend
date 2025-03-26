import crypto from 'crypto'

const getMd5Hash = (message: string): string => {
	return crypto.createHash('md5').update(message, 'utf-8').digest('hex')
}

export default getMd5Hash
