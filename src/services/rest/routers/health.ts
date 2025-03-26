import { Router } from 'deps'

const router = new Router()

router.post('/health', async (ctx) => {
	ctx.body = 'OK'
})

export default router
