const methodsOnDbCollection = {
	allQueryTypes: [
		'aggregate',
		'analyzeShardKey',
		'bulkWrite',
		'checkMetadataConsistency',
		'compactStructuredEncryptionData',
		'configureQueryAnalyzer',
		'count',
		'countDocuments',
		'createIndex',
		'createIndexes',
		'createSearchIndex',
		'dataSize',
		'deleteMany',
		'deleteOne',
		'distinct',
		'drop',
		'dropIndex',
		'dropIndexes',
		'dropSearchIndex',
		'ensureIndex',
		'estimatedDocumentCount',
		'explain',
		'find',
		'findAndModify',
		'findOne',
		'findOneAndDelete',
		'findOneAndReplace',
		'findOneAndUpdate',
		'getIndexes',
		'getPlanCache',
		'getSearchIndexes',
		'getShardDistribution',
		'getShardVersion',
		'hideIndex',
		'initializeOrderedBulkOp',
		'initializeUnorderedBulkOp',
		'insert',
		'insertMany',
		'insertOne',
		'isCapped',
		'latencyStats',
		'mapReduce',
		'reIndex',
		'remove',
		'renameCollection',
		'replaceOne',
		'stats',
		'storageSize',
		'totalIndexSize',
		'totalSize',
		'unhideIndex',
		'update',
		'updateMany',
		'updateOne',
		'updateSearchIndex',
		'validate',
		'watch',
	],
	// currentlySupportedQueryTypes: [
	// 	'find',
	// 	'findOne',
	// 	'aggregate',
	// 	'countDocuments',
	// ],
	allChainedOperations: [
		// Cursor methods
		'sort', // Sorts the results
		'limit', // Limits the number of documents returned
		'skip', // Skips a specified number of documents
		'project', // Specifies the fields to return (same as projection parameter)
		'count', // Returns the count of documents that match the query
		'distinct', // Returns an array of distinct values for a field

		// Aggregation-related
		'group', // Groups documents by specified expression
		'match', // Filters the documents
		'unwind', // Deconstructs an array field
		'lookup', // Performs a left outer join

		// Explanatory
		'explain', // Returns information on the query execution

		// Batching
		'batchSize', // Controls the number of documents returned in each batch

		// Indexing hints
		'hint', // Forces MongoDB to use a specific index

		// Text search
		'metaTextScore', // Add text score field for text search queries

		// Miscellaneous
		'collation', // Specify language-specific rules for string comparison
		'comment', // Adds a comment to the query for tracking
		'maxTimeMS', // Sets a time limit for query execution

		// Boolean operations
		'and', // Joins query clauses with a logical AND
		'or', // Joins query clauses with a logical OR
		'nor', // Joins query clauses with a logical NOR

		// Cursor specific operations
		'forEach', // Iterates over the cursor
		'map', // Maps each document via a function
		'hasNext', // Checks if the cursor has more documents
		'next', // Returns the next document
		'toArray', // Returns all documents as an array
	],
	validChainedOperations: [
		'sort',
		'limit',
		'skip',
		'project',
		'count',
		'toArray',
	],
}

export default methodsOnDbCollection
