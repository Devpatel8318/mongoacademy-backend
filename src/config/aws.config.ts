export default {
	common: {
		region: 'ap-south-1',
		accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
	},
	sqs: {
		region: 'ap-south-1',
		restToQueryProcessorQueue:
			process.env.MONGOACADEMY_REST_TO_QUERYPROCESSOR_QUEUE_URL || '',
	},
	s3: {},
	cloudFront: {
		cloudFrontUrl: process.env.CLOUDFRONT_URL || '',
		keyPairId: process.env.CLOUDFRONT_KEY_PAIR_ID || '',
		privateKey:
			process.env.CLOUDFRONT_PRIVATE_KEY?.replace(/\\n/g, '\n') || '',
	},
}
