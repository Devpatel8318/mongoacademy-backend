import { Context, Next } from 'deps'
import { logToCloudWatch } from 'utils/aws/cloudWatch/logToCloudWatch'

const logSubmissionToCloudWatch = async (
	ctx: Context,
	next: Next,
	submissionType: 'submit' | 'run' | 'evaluate' | 'runOnlyRetrieve'
) => {
	const { user, question } = ctx.state.shared
	const { userId } = user
	const { questionId } = question

	const data = { userId, questionId }

	switch (submissionType) {
		case 'submit': {
			const { answer } = ctx.state.shared
			const { submissionId } = answer

			Object.assign(data, {
				message: `Submission request received`,
				answer,
				submissionId,
			})
			break
		}
		case 'run': {
			const { answer } = ctx.state.shared

			Object.assign(data, {
				message: `Run request received`,
				answer,
			})
			break
		}
		case 'evaluate': {
			const { submissionId } = ctx.state.shared
			const { question: questionRedisKey, answer: answerRedisKey } = ctx
				.request.body as {
				question: string
				answer: string
			}

			Object.assign(data, {
				message: `Evaluation request received`,
				submissionId,
				questionRedisKey,
				answerRedisKey,
			})
			break
		}
		case 'runOnlyRetrieve': {
			const { answer: answerRedisKey } = ctx.request.body as {
				answer: string
			}

			Object.assign(data, {
				message: `Run only retrieve request received`,
				answerRedisKey,
			})
			break
		}

		default:
			break
	}

	await logToCloudWatch({
		group: 'BACKEND',
		stream: 'REST',
		data,
	})

	return next()
}

export default logSubmissionToCloudWatch
