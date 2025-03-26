import answer from './answer'
import user from './user'
import auth from './auth'

const routers = [answer, user, auth]

export default (app: any) => {
	routers.forEach((router) => {
		app.use(router.routes()).use(router.allowedMethods())
	})
}
