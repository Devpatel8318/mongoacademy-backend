import { Context, Next } from 'deps'
import { FieldError } from 'Types/global'

export type ValidatorContext = Context

interface ValidatorFunction {
	(
		// eslint-disable-next-line no-unused-vars
		ctx: ValidatorContext
	): Promise<FieldError | null | string> | FieldError | null | string
}

const validator = (validatorFunctions: ValidatorFunction[]) => {
	return async (ctx: Context, next: Next) => {
		ctx.state.shared = { ...ctx.state.shared }
		ctx.state.validationErrors = [] as string[]
		ctx.state.continueCheckingOtherValidators = true
		const response: (string | null | FieldError)[] = []

		for await (const validatorFn of validatorFunctions) {
			if (!ctx.state.continueCheckingOtherValidators) {
				break
			}

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
