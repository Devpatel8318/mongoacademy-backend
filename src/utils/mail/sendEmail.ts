import sgMail from '@sendgrid/mail'
import config from 'config'
import { templateMapper } from './templates'

sgMail.setApiKey(config.sendGrid.sendGridApiKey)

const sendEmail = async <T extends keyof typeof templateMapper>(
	to: string,
	type: T,
	data: Parameters<(typeof templateMapper)[T]>[0]
) => {
	const msg = {
		to,
		from: config.sendGrid.senderEmail,
		...templateMapper[type](data),
	}

	try {
		await sgMail.send(msg)
		return {
			success: true,
		}
	} catch (error) {
		console.error('Error sending email:', msg, error)
		return {
			success: false,
			error:
				error instanceof Error ? error.message : 'Failed to send email',
		}
	}
}

export default sendEmail
