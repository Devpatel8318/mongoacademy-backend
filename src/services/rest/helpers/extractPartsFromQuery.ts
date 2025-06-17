import queriesRequiringToArray from 'utils/mongodb/queriesRequiringToArray'

export interface ChainedOperation {
	operation: string
	params: string | number | Record<string, any>
}

// Extract the main query parameters by finding matching parentheses
const extractBetweenMatchingParentheses = (str: string, startPos: number) => {
	let openCount = 0
	let closeCount = 0
	let startFound = false
	let start = -1

	for (let i = startPos; i < str.length; i++) {
		if (str[i] === '(') {
			if (!startFound) {
				start = i + 1
				startFound = true
			}
			openCount++
		} else if (str[i] === ')') {
			closeCount++
			if (startFound && openCount === closeCount) {
				return str.substring(start, i)
			}
		}
	}
	return ''
}

const splitMongoArguments = (str: string): string[] => {
	const result = []
	let current = ''
	let depth = 0

	for (let i = 0; i < str.length; i++) {
		const char = str[i]
		if (char === '{' || char === '[' || char === '(') {
			depth++
		} else if (char === '}' || char === ']' || char === ')') {
			depth--
		} else if (char === ',' && depth === 0) {
			result.push(current)
			current = ''
			continue
		}
		current += char
	}
	if (current.trim()) result.push(current)
	return result
}

const extractPartsFromQuery = (query: string) => {
	const dbCollectionRegex = /db\.(\w+)\.(\w+)\(/
	const dbCollectionMatch = query.match(dbCollectionRegex)

	if (!dbCollectionMatch) {
		return {
			errorMessage: 'Invalid MongoDB query string format',
		}
	}

	const [, collection, queryType] = dbCollectionMatch

	// Find the position of the query type function
	const queryTypePos = query.indexOf(`${queryType}(`)

	// Extract arguments inside the queryType(...)
	const fullArgText = extractBetweenMatchingParentheses(query, queryTypePos)

	const splitArgs = splitMongoArguments(fullArgText)

	const queryFilter = splitArgs[0]?.trim()
	const queryUpdate = splitArgs[1]?.trim()
	const queryOptions = splitArgs[2]?.trim()

	// Extract chained operations
	const chainedOps = [] as ChainedOperation[]
	let remainingQuery = query
	let dotOpIndex = remainingQuery.indexOf('.')

	// Skip the first operation (the main query)
	if (dotOpIndex !== -1) {
		dotOpIndex = remainingQuery.indexOf('.', dotOpIndex + 1)
	}

	let hasToArray = false

	while (dotOpIndex !== -1) {
		// Extract the operation name
		const opStartIndex = dotOpIndex + 1
		const opEndIndex = remainingQuery.indexOf('(', opStartIndex)
		if (opEndIndex === -1) break

		const operation = remainingQuery.substring(opStartIndex, opEndIndex)

		// Check if this operation is toArray
		if (operation === 'toArray') {
			hasToArray = true
		}

		// Extract the operation parameters
		const params = extractBetweenMatchingParentheses(
			remainingQuery,
			opEndIndex
		)

		if (operation !== queryType) {
			chainedOps.push({
				operation,
				params: params.trim(),
			})
		}

		const closeParenIndex = remainingQuery.indexOf(')', opEndIndex)
		if (closeParenIndex === -1) break

		dotOpIndex = remainingQuery.indexOf('.', closeParenIndex)
	}

	if (typeof queryType === 'string') {
		if (queriesRequiringToArray.includes(queryType) && !hasToArray) {
			return {
				errorMessage: `Query type '${queryType}' requires .toArray() but it was not found`,
			}
		}

		if (!queriesRequiringToArray.includes(queryType) && hasToArray) {
			return {
				errorMessage: `Query type '${queryType}' does not support .toArray() but it was found`,
			}
		}
	}

	return {
		collection,
		queryType,
		queryFilter,
		queryUpdate,
		queryOptions,
		chainedOps,
	}
}

export default extractPartsFromQuery
