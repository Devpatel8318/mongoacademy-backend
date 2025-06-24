// MongoDB
import {
	MongoClient,
	Collection,
	type Db,
	type Document,
	type Filter,
	type Sort,
	type UpdateFilter,
	type UpdateOptions,
} from 'mongodb'

// Koa
import Koa, { type Context, type Next } from 'koa'
import Router from 'koa-router'
import cors from '@koa/cors'
import bodyParser from 'koa-bodyparser'
import errorHandler from 'koa-json-error'
import logger from 'koa-logger'
import responseTime from 'koa-response-time'

import { Redis } from 'ioredis'
import isEqual from 'lodash.isequal'
import { isFilterValid } from 'mongodb-query-parser'
import axios from 'axios'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import bluebird from 'bluebird'
import process from 'process'
import dotenv from 'dotenv'
import { Readable } from 'stream'

// AWS SDK
import {
	SQSClient,
	SendMessageCommand,
	type MessageAttributeValue,
} from '@aws-sdk/client-sqs'
import {
	S3Client,
	PutObjectCommand,
	type PutObjectRequest,
} from '@aws-sdk/client-s3'
import {
	SecretsManagerClient,
	GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager'
import { getSignedUrl } from '@aws-sdk/cloudfront-signer'

export {
	MongoClient,
	Collection,
	Db,
	Document,
	Filter,
	Sort,
	UpdateFilter,
	UpdateOptions,
	Koa,
	Router,
	cors,
	Context,
	Next,
	bodyParser,
	errorHandler,
	logger,
	responseTime,
	SQSClient,
	SendMessageCommand,
	MessageAttributeValue,
	S3Client,
	PutObjectCommand,
	PutObjectRequest,
	SecretsManagerClient,
	GetSecretValueCommand,
	getSignedUrl,
	Redis,
	isEqual,
	isFilterValid,
	axios,
	jwt,
	crypto,
	bcrypt,
	bluebird,
	dotenv,
	process,
	Readable,
}
