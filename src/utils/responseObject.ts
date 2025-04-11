import { FieldError, SuccessResponse } from 'Types/global'

// export const globalErrorFormatter = (err) => ({
// 	status: err.status || 400,
// 	success: err.success || false,
// 	message: err.message,
// 	reasons: err.reasons,
// })

// export const failureObject = (
// 	reasons: FieldError[],
// 	message: string,
// ): FailureObject => {
// 	return {
// 		success: false,
// 		reasons,
// 		message: message || 'Something went wrong.',
// 	}
// }

export const successObject = (message = '', data = {}): SuccessResponse => {
	return {
		success: true,
		message: message || 'data displayed successfully.',
		...(Object.keys(data).length && { data }),
	}
}

export const validationError = (
	message: string,
	field?: string
): FieldError => {
	return {
		message: message || 'Validation Failed.',
		field: field || 'common',
	}
}
