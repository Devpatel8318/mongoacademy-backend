import { Context, Next } from 'deps'
import { FieldError } from 'Types/global'

interface ValidatorFunction {
	// eslint-disable-next-line no-unused-vars
	(ctx: Context): FieldError | null | string | Promise<string | null>
}

const validator = (validatorFunctions: ValidatorFunction[]) => {
	return async (ctx: Context, next: Next) => {
		ctx.state.validationErrors = [] as string[]
		const response: (string | null | FieldError)[] = []

		for await (const validatorFn of validatorFunctions) {
			const validationResult = await validatorFn(ctx)
			validationResult !== null &&
				ctx.state.validationErrors.push(validationResult)

			response.push(validationResult)
		}

		const errorResult = response.filter(Boolean)
		const isValidationSuccess = errorResult.length === 0

		if (isValidationSuccess) {
			return next()
		}

		ctx.throw(400, 'Validation Failed.', { reasons: errorResult })
	}
}

export default validator
