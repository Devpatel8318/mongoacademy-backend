import { getSignedUrl } from 'deps'
import config from 'config'

const getCloudFrontSignedUrl = (s3ObjectKey: string) => {
	const url = `${config.aws.cloudFront.cloudFrontUrl}/${s3ObjectKey}`

	return getSignedUrl({
		url,
		keyPairId: config.aws.cloudFront.keyPairId,
		privateKey: config.aws.cloudFront.privateKey,
		dateLessThan: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
	})
}

export default getCloudFrontSignedUrl
