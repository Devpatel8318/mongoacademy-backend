import http from 'http'
import app from './app'
import { AnyType } from 'Types/anyType'

const server = http.createServer(app.callback())

const port = parseInt(process.env.BACKEND_PORT || '8000')

server.listen(port, () => {
	console.log(`Server running successfully on port: ${port}`)
})

server.on('error', (err: AnyType) => {
	console.log('Error occurred on starting the server')
	console.log(err)
})
