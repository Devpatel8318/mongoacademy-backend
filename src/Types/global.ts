export interface FieldError {
	field: string
	message: string
}

export interface SuccessResponse {
	success: boolean
	message: string
	data?: Object
}

export type Status = 1 | 2 | 3 // TODO | ATTEMPTED | SOLVED
