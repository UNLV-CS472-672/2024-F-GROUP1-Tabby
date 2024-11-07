/**
 * This is a helper function for catching exceptions generated from
 * promise functions.
 * @param promise Provide the actual promise to call
 * @param errorsToCatch Provide exceptions to catch from this promise if any.
 * @returns An array of that contains the data and error if any is generated.
 *  If we have data, then that means no error was generated and the error value will be undefined.
 *  If we have an error, we can NOT say that there is no data. Only that the
 *  error value will contain the thrown message. 
 */
export async function catchErrorTyped<T, E extends new (message?: string) => Error> (
    promise: Promise<T>,
    errorsToCatch?: E[]
): Promise<[undefined, T] | [InstanceType<E>]> {
    /// 11: Create a function that returns something of type Generic and
    ///     something that extends from the Error type.
    ///
    /// 12: The parameters of this function will be any promise
    ///     of any type, and an array of type Errors.
    ///
    /// 14: Function will return an array with something of type
    ///     undefined or generic type, and an error of type Error.
    return promise
        // Essentially, this .then will run the promise. 
        // If all goes to plan and no errors are thrown,
        // we will return this data
        .then(data => {
            return [undefined, data] as [undefined, T]
        })
        .catch(error => {
            // An error was thrown, see if we defined any errors to catch.
            // If not, just 'catch' all errors and return that to the callee.
            if (errorsToCatch == undefined) {
                return [error]
            }

            // If we did define something, check to see if the error thrown
            // is of that type. If it is, return that error.
            if (errorsToCatch.some(e => error instanceof e)) {
                return [error]
            }

            // Otherwise, the ErrorToCatch array is populated and the error thrown
            // is not of any Error type in the array, re-throw this error.
            throw error
        }
    )       // Return, END
}
