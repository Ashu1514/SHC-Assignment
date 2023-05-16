/**
 * Helper function to create an error response object
 * @param {number} statusCode - HTTP status code for the error response
 * @param {string} message - Error message
 * @returns {object} - Error response object
 */
const createErrorResponse = (statusCode, message) => ({
  statusCode: statusCode || 501,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    error: message || "An Error occurred.",
  }),
});

/**
 * Function to handle and return an error response
 * @param {Error} error - Error object
 * @param {Function} callback - Callback function to return the error response
 */
const returnError = (error, callback) => {
  console.log(error);
  if (error.name) {
    const message = `Invalid ${error.path}: ${error.value}`;
    callback(null, createErrorResponse(400, `Error:: ${message}`));
  } else {
    callback(
      null,
      createErrorResponse(error.statusCode || 500, `Error:: ${error.name}`)
    );
  }
};

module.exports = returnError;
