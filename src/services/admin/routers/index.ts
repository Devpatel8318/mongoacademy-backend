import admin from './admin'

const routers = [admin]

export default (app: any) => {
	routers.forEach((router) => {
		app.use(router.routes()).use(router.allowedMethods())
	})
}
