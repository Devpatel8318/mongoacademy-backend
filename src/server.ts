//TODO: try to remove credentials from aws, as it might take it from env automatically
// TODO: check why toArray() is not necessary in simple match aggregate step
// TODO: normalize question and answer to JSON which have fields wrapped in quotes. (JSON.stringify is useful)
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
