export interface FieldError {
	field: string
	message: string
}

export interface SuccessResponse {
	success: boolean
	message: string
	data?: Object
}
