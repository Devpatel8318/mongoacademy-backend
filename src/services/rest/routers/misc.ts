import { Router } from 'deps'

const router = new Router()

router.get('/', async (ctx) => {
	ctx.body = 'OK'
})

router.get('/health', async (ctx) => {
	ctx.body = 'OK'
})

export default router
