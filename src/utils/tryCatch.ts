type Success<T> = [data: T, error: null]

type Failure = [data: null, error: Error]

type Result<T> = Success<T> | Failure

// Main wrapper function
export const tryCatch = async <T>(
	input: Promise<T> | (() => Promise<T>)
): Promise<Result<T>> => {
	try {
		const promise = typeof input === 'function' ? input() : input
		const data = await promise
		return [data, null]
	} catch (error) {
		return [null, error as Error] // ! it is not guarantee that error is instance of Error (js can throw “abc” , null , undefined) but for simplicity using this.
	}
}

export const tryCatchSync = <T>(fn: () => T): Result<T> => {
	try {
		return [fn(), null]
	} catch (error) {
		return [null, error as Error] // ! it is not guarantee that error is instance of Error (js can throw “abc” , null , undefined) but for simplicity using this.
	}
}
