/**
 * Exception class for Non-200 Status Codes. This mean any
 *  status code that is no 2xx. 
 * Ex. 201, 202, 204    are all Valid
 *     404, 405, 416    are all Invalid
 */
export class Non200Status extends Error {
    name:string = "Non-200 Status Code";
    message:string = "Non-200 Status Code Found";
}
