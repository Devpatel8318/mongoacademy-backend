/* global console */
import axios from 'axios'
import process from 'process'
import dotenv from 'dotenv'
const NODE_ENV = 'development'
dotenv.config({ path: `.env.${NODE_ENV}` })

const OWNER = 'Devpatel8318'
const REPO = 'mongoacademy-backend'
const WORKFLOW_FILE_NAME = 'deploy.yml'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN

const REF = 'main' // branch to run workflow on

const triggerWorkflow = async () => {
	try {
		await axios.post(
			`https://api.github.com/repos/${OWNER}/${REPO}/actions/workflows/${WORKFLOW_FILE_NAME}/dispatches`,
			{
				ref: REF,
			},
			{
				headers: {
					Accept: 'application/vnd.github+json',
					Authorization: `Bearer ${GITHUB_TOKEN}`,
					'X-GitHub-Api-Version': '2022-11-28',
				},
			}
		)
		console.log('Workflow triggered successfully!')
	} catch (error) {
		console.error('Failed to trigger workflow:', error)
	}
}

triggerWorkflow()
