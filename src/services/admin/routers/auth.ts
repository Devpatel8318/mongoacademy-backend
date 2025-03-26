// import { Router } from 'deps'

// // import auth from '../middlewares/auth'
// import validator from '../middlewares/validator'

// import {
// 	doesQuestionExist,
// 	isEmailAvailable,
// 	isLoginFieldsValid,
// 	isPasswordAvailable,
// 	isPasswordCorrect,
// 	isRefreshTokenValid,
// } from '../validators/adminValidators'

// import {
// 	getAllQuestions,
// 	getOneQuestions,
// 	loginAdmin,
// 	// getAccessToken,
// } from '../controllers/adminController'

// const router = new Router({ prefix: '/auth' })

// router.post(
// 	'/login',
// 	validator([
// 		isLoginFieldsValid,
// 		isEmailAvailable,
// 		isPasswordAvailable,
// 		isPasswordCorrect,
// 	]),
// 	loginAdmin,
// )

// router.get('/refresh', validator([isRefreshTokenValid]), getAccessToken)
// // router.get('/refresh', getAccessToken);

// // read all
// // router.get('/list', auth, getAllQuestions);
// router.get('/list', getAllQuestions)

// // read one
// router.get(
// 	'/view/:questionId',
// 	validator([doesQuestionExist]),
// 	getOneQuestions,
// )

// // create
// // router.post('/list', getAllQuestions);

// // update
// router.put('/list', getAllQuestions)

// // delete
// router.delete('/list', getAllQuestions)

// export default router
