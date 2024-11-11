import { Non200Status } from "./error";

/**
 * Datatype for the http helper function
 * 
 * @param {string} domain The URL for the HTTP call.
 * @param {string} route Optional. Follows after the URL/... 
 * @param {string} body Optional. Build the body for the request
 * @param {} method Specify what method to use. Different methods
 *  may require parameters be utilized.
 * @param {string} type Specify the datatype of the body
 * 
 * @note For continuity, domain is expected to contain the /
 */
type http = {
    domain: string,     // URL
    route?: string,     // What is the target route
    body?: string,      // Body of API request
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',   // HTTP Method
    type: string        // 'application/json'
}

/*
    /// HTTP Request: https://bobbyhadz.com/blog/typescript-http-request
    /// Exception handling: https://www.youtube.com/watch?v=AdmGHwvgaVs

    /// NOTE: For all following request calls, follow the example of
    /// the HTTP GET Example for how best to use the two functions

    // Imports
    import { http_callback } from '@/types/api_request';
    import { catchErrorTyped } from '@/types/error_handle';
    import { Non200Status } from '@/types/error';

    // HTTP GET Example
    const [error, value] = await catchErrorTyped(http_callback({
        domain: "https://reqres.in/api/",
        route: "members",
        method: "GET",
        type: "application/json"
    }), [Non200Status]);
    // ^^^ Will only catch one type of error.

    if (error) {
        console.log("Error Found ", error.message);
    } else {
        console.log(value);
    }

    // HTTP POST Example
    await http_callback({
        domain: "https://reqres.in/api/",
        route: 'users',
        method: "POST",
        body: JSON.stringify({
            name: 'John Deering',
            job: 'manager',
        }),
        type: "application/json"
    });

    // HTTP PUT Example
    await http_callback({
        domain: "https://reqres.in/api/",
        route: 'users/2',
        method: "PUT",
        body: JSON.stringify({
            name: 'morpheus',
            job: 'Zion Resident',
        }),
        type: "application/json"
    });

    // HTTP PATCH Example
    await http_callback({
        domain: "https://reqres.in/api/",
        route: 'users/2',
        method: "PATCH",
        body: JSON.stringify({
            name: 'Zion Resident',
            job: 'Morphing',
        }),
        type: "application/json"
    });

    // HTTP DELETE Example
    await http_callback({
        domain: "https://reqres.in/api/",
        route: 'users/2',
        method: "DELETE",
        type: "application/json"
    });
*/

/**
 * Helper function for HTTP request.
 * @param {http} request Condensed datatype containing
 *  neccessary attributes.
 * 
 * @returns {Promise<any>} Returns the full response from the API. It is
 *  expected from the user to then cast this to the needed type.
 * 
 * @note Function will throw any exception if one is found. It is recomended to use the
 *  acompanying catchErrorType function in the error_handle.ts file to handle exceptions.
 *  Example for the use of this function will be placed at this location.
 */
export async function http_callback(request:http):Promise<any> {
    // Check to see if our request is any of the following:
    // null,    undefined,  NaN
    // empty string ('')
    // 0,       false
    if (!request.route) {
        // If it is, just replace it with an empty string
        request.route = "";
    }

    if (!request.body) {
        request.body = "";
    }

    // Construct the request as specified and and attempt to call it
    // Note: response is of type Response
    const response = await fetch(request.domain + request.route, {
            method: request.method,
            body: request.body,
            headers: {
                'Content-Type': request.type,
                Accept: request.type,
            },
        }
    );

    // Check the response for 200 type return status
    if (!response.ok) {
        throw new Non200Status(`Non-200 Status: ${response.status}`);
    }

    // DEBUG, Print all parameters
    // let msg:string = 
    //     `\n\tURL: ${request.domain + request.route}\n` +
    //     `\tMethod: ${request.method}\n` +
    //     `\tType: ${request.type}`
    // ;

    let result = "Deleted.";

    // Notice that upon deleting, it is likely to get a 204 status code. 
    // That is, no content. Can't parse an empty string so don't.
    if (request.method !== "DELETE") {
        // Get json of the response
        // Note: result should be of type whatever the API returned.
        // We expect the user to cast that after it is returned.
        result = await response.json();
    }

    // DEBUG, Remove this print line in the future
    // console.log('result is: ', JSON.stringify(result, null, 4));

    return JSON.stringify(result, null, 4);
}
