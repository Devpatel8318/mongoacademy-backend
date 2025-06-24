import sgMail from '@sendgrid/mail'
import config from 'config'

sgMail.setApiKey(config.sendGrid.sendGridApiKey)

const sendEmail = async (
	to: string,
	data: {
		subject: string
		text: string
		html: string
	}
) => {
	const msg = {
		to,
		from: config.sendGrid.senderEmail,
		...data,
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
