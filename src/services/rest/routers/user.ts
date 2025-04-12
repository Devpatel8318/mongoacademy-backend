import { Router } from 'deps'

import { userSetting } from '../controllers/user.controller'

import auth from 'services/rest/middlewares/auth'

const router = new Router({ prefix: '/user' })

router.get('/setting', auth, userSetting)

router.get('/test/:id', (ctx) => {
	console.log(ctx.params.id)
	console.log(ctx.query.df)
	ctx.body = `Hello World ${ctx.params.id}`
})

export default router
