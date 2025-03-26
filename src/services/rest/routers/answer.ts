import { Router } from 'deps'

import {
	getAllQuestions,
	getSolution,
	submitAnswer,
} from '../controllers/answer.controller'

const router = new Router({ prefix: '/answer' })

router.post('/submit', submitAnswer)

router.get('/list', getAllQuestions)

router.post('/solution', getSolution)

export default router
