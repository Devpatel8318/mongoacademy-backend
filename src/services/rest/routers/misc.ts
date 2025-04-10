import { Router } from 'deps'

const router = new Router()

router.get('/', async (ctx) => {
	ctx.body = 'OK'
})

router.get('/health', async (ctx) => {
	ctx.body = 'OK'
})

router.get('/play', async (ctx) => {
	ctx.body = 'Ok'
})

export default router
