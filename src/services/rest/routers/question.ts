import { Router } from 'deps'

import {
	getAllQuestions,
	getSolution,
} from '../controllers/question.controller'

import auth from '../middlewares/auth'

const router = new Router({ prefix: '/answer' })

router.get('/list', auth, getAllQuestions)

router.post('/solution', auth, getSolution)

export default router
