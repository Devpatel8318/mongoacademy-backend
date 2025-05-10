export default {
	sqs: {
		region: 'ap-south-1',
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
		restToQueryProcessorQueue:
			process.env.MONGOACADEMY_REST_TO_QUERYPROCESSOR_QUEUE_URL || '',
	},
	s3: {
		region: 'ap-south-1',
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},
	cloudFront: {
		cloudFrontUrl: process.env.CLOUDFRONT_URL || '',
		keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
		privateKey: process.env.CLOUDFRONT_PRIVATE_KEY || '',
	},
}
