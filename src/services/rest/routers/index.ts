import answer from './answer'
import user from './user'
import auth from './auth'
import misc from './misc'
import question from './question'

const routers = [answer, user, auth, misc, question]

export default (app: any) => {
	routers.forEach((router) => {
		app.use(router.routes()).use(router.allowedMethods())
	})
}
