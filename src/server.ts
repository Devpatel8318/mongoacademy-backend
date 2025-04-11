// TODO: add security in submit answer api
// TODO: replace ctx.throw with failureObject (make new)
//TODO: make separate routes for answer and question
//TODO: change names of queries from get to find like 'findOneQuestion' 'findAllQuestions'
//TODO: user absolute paths for mongoDb Connection
import http from 'http'
import app from './app'
import config from 'config'
import { AnyType } from 'Types/anyType'

const server = http.createServer(app.callback())

const port = config.common.PORT

server.listen(port, () => {
	console.log(`Server running successfully on port: ${port}`)
})

server.on('error', (err: AnyType) => {
	console.log('Error occurred on starting the server')
	console.log(err)
})
