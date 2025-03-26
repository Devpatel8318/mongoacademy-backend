import answer from './answer'
import user from './user'
import auth from './auth'
import health from './health'

const routers = [answer, user, auth, health]

export default (app: any) => {
	routers.forEach((router) => {
		app.use(router.routes()).use(router.allowedMethods())
	})
}
