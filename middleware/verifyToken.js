const jwt = require("jsonwebtoken");

//Verify token middleware function
const verifyToken = (req, res, next) => {
	//get auth header value
	const bearerHeader = req.headers["authorization"];

	if (typeof bearerHeader === `undefined`) {
		// if our bearerHeader doesn't exist, throw 400 bad request
		return res.sendStatus(400);
	}

	// split at space between 'bearer' and token
	const bearer = bearerHeader.split(" ");
	const bearerToken = bearer[1];

	//If token doesn't exist, throw 401 unauthorized
	if (bearerToken == null) {
		return res.sendStatus(401);
	}

	//Verify token is valid
	jwt.verify(bearerToken, process.env.SECRET, (err, user) => {
		if (err) {
			return res.sendStatus(403); //throw 403 forbidden
		}
		req.user = user;
		next();
	});
};

module.exports = verifyToken;
