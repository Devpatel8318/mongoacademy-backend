import loadSecrets from './scripts/loadSecrets.js'

const start = async () => {
	await loadSecrets()
	import('./server.js')
}

start()
