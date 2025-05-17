import { getSignedUrl } from '@aws-sdk/cloudfront-signer'
import config from 'config'

const getCloudFrontSignedUrl = (s3ObjectKey: string) => {
	const url = `${config.aws.cloudFront.cloudFrontUrl}/${s3ObjectKey}`

	console.log('url', url)

	return getSignedUrl({
		url,
		keyPairId: config.aws.cloudFront.keyPairId,
		privateKey: config.aws.cloudFront.privateKey,
		dateLessThan: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
	})
}

export default getCloudFrontSignedUrl
