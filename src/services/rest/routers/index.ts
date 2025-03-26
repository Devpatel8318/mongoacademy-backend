import answer from './answer'
import user from './user'
import auth from './auth'
import misc from './misc'

const routers = [answer, user, auth, misc]

export default (app: any) => {
	routers.forEach((router) => {
		app.use(router.routes()).use(router.allowedMethods())
	})
}
