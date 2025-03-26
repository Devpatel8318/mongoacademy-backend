import Koa from 'koa'
import cors from '@koa/cors'
import responseTime from 'koa-response-time'
import logger from 'koa-logger'
import errorHandler from 'koa-json-error'
import bodyParser from 'koa-bodyparser'

import restRoutes from 'services/rest/routers'
import adminRoutes from 'services/admin/routers'

const app = new Koa()

const adminFrontUrl = process.env.ADMIN_FRONTEND_URL || ''
const userFrontUrl = process.env.USER_FRONTEND_URL || ''

const corsOptions: cors.Options = {
	origin: (request) => {
		const allowedOrigins = [userFrontUrl, adminFrontUrl]
		return allowedOrigins.includes(request.header.origin || '')
			? request.header.origin || ''
			: ''
	},
	credentials: () => true, // Use a function returning true
}

app.use(responseTime())
app.use(logger())

// cors
app.use(cors(corsOptions))

// interface CustomError {
// 	expose: boolean
// 	status: number
// 	message: string
// 	success?: boolean
// 	reasons?: FieldError[]
// }

// Global Error Handler
export const formatError = (err: any) => {
	// Check if the error has an expose flag and handle accordingly.
	if (err.expose) {
		return {
			status: err.status || 400,
			success: err.success,
			message: err.message,
			reasons: err.reasons,
		}
	}
	// Default error response for unexposed errors.
	return {
		status: 500,
		message: 'Internal Server Error',
	}
}
app.use(
	errorHandler({
		format: formatError,
	})
)

app.use(
	bodyParser({
		enableTypes: ['text', 'json', 'form', 'raw'],
		onerror(_err, ctx) {
			ctx.throw('Invalid Body', 422)
		},
	})
)

const routers = [restRoutes, adminRoutes]

routers.forEach((setUpRoute) => {
	setUpRoute(app)
})

// 404 Middleware
app.use((ctx) => {
	ctx.response.status = 404
	ctx.body = { message: 'Route does not exist' }
})

export default app
