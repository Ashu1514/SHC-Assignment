const jwt = require("jsonwebtoken");

// Generates an authorization response object
function generateAuthResponse(principalId, effect, methodArn) {
  const policyDocument = generatePolicyDocument(effect, methodArn);

  return {
    principalId,
    policyDocument,
  };
}

// Generates a policy document for the authorization response
function generatePolicyDocument(effect, methodArn) {
  if (!effect || !methodArn) return null;

  const policyDocument = {
    Statement: [
      {
        Action: "execute-api:Invoke",
        Effect: effect,
        Resource: methodArn,
      },
    ],
  };

  return policyDocument;
}

// Verify token and authorize the request
module.exports.verifyToken = async (event, context, callback) => {
  try {
    const token = event.authorizationToken.replace("Bearer ", "");
    const methodArn = event.methodArn;

    if (!token || !methodArn) return callback(null, "Unauthorized");

    const secret = process.env.JWT_SECRET;

    // Verify the token
    const decoded = jwt.verify(token, secret);

    console.log(decoded);

    if (decoded && decoded.id) {
      // Generate an authorization response with "Allow" effect
      return callback(
        null,
        generateAuthResponse(decoded.id, "Allow", methodArn)
      );
    } else {
      // Generate an authorization response with "Deny" effect
      return callback(
        null,
        generateAuthResponse(decoded.id, "Deny", methodArn)
      );
    }
  } catch (error) {
    console.error(error);
    return callback(null, "Unauthorized");
  }
};
