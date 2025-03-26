// MongoDB
import { MongoClient, Collection, type Document, type Sort } from 'mongodb'

// Koa (Oak alternative)
import Koa from 'koa'
import Router from '@koa/router'
import cors from '@koa/cors'
import type { Context, Next } from 'koa'

// Lodash for deep comparison
import isEqual from 'lodash.isequal'

// MongoDB Query Validator
import { isFilterValid } from 'mongodb-query-parser'

// AWS SQS SDK
import {
	SQSClient,
	SendMessageCommand,
	type MessageAttributeValue,
} from '@aws-sdk/client-sqs'

// Redis Client
import { Redis } from 'ioredis'

// Axios for HTTP requests
import axios from 'axios'

// Exporting all imports for easy access
export {
	MongoClient,
	Collection,
	Document,
	Sort,
	Koa,
	Router,
	cors,
	Context,
	Next,
	isEqual,
	isFilterValid,
	SQSClient,
	SendMessageCommand,
	axios,
	MessageAttributeValue,
	Redis,
}
