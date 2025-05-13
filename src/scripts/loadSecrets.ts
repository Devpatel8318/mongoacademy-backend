import dotenv from 'dotenv'
dotenv.config()

import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'

const nodeEnv = process.env.NODE_ENV || 'development'
console.log('Environment=>', nodeEnv)

const isLocal = nodeEnv === 'development'

const loadSecrets = async () => {
	if (isLocal) {
		console.log('using local environment variables')
	} else {
		console.log('using AWS Secrets Manager environment variables')

		const secret_name = 'mongoacademy/production'

		try {
			const client = new SecretsManagerClient({
				region: 'ap-south-1',
			})

			const command = new GetSecretValueCommand({
				SecretId: secret_name,
			})

			const response = await client.send(command)

			if (response.SecretString) {
				const secrets = JSON.parse(response.SecretString)
				Object.entries(secrets).forEach(([key, value]) => {
					process.env[key] = value as string
				})

				console.log('Injected secrets into process.env')
			}
		} catch (error) {
			console.error('Error loading secrets:', error)
		}
	}
}

export default loadSecrets
