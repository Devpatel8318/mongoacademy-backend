import {
	S3Client,
	PutObjectCommand,
	PutObjectRequest,
	axios,
	Readable,
} from 'deps'
import config from 'config'

const s3 = new S3Client({
	region: config.aws.s3.region,
	credentials: {
		accessKeyId: config.aws.s3.accessKeyId,
		secretAccessKey: config.aws.s3.secretAccessKey,
	},
})

export const uploadMediaToS3 = async ({
	Bucket,
	Key,
	Body,
	ContentType,
	ContentLength,
}: PutObjectRequest): Promise<{ success: boolean; error?: string }> => {
	try {
		if (!Body) {
			throw new Error('Body is required for S3 upload')
		}

		const command = new PutObjectCommand({
			Bucket,
			Key,
			Body,
			ContentType,
			ContentLength,
		})

		await s3.send(command)

		return { success: true }
	} catch (error) {
		console.error(`S3 Upload Error for key "${Key}":`, error)
		return { success: false, error: (error as Error).message }
	}
}

export const uploadImageFromUrlToS3 = async (
	imageUrl: string,
	Key: string,
	Bucket: string
) => {
	const response = await axios.get(imageUrl, {
		responseType: 'arraybuffer',
	})

	const imageBuffer = Buffer.from(response.data)
	const contentType = response.headers['content-type'] || 'image/jpeg'

	return await uploadMediaToS3({
		Bucket,
		Key,
		Body: Readable.from(imageBuffer),
		ContentType: contentType,
		ContentLength: imageBuffer.length,
	})
}
