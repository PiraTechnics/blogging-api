const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.register = [
	body("firstname", "Name cannot be empty").trim().not().isEmpty(),
	body("lastname", "Name cannot be empty").trim().not().isEmpty(),
	body("username", "Name must contain at least 6 characters")
		.trim()
		.isLength({ min: 6 }),
	body("password", "Password must be at least 8 characters").isLength({
		min: 8,
	}),
	body("passwordConfirmation", "Passwords must match!").custom(
		(value, { req }) => {
			return value === req.body.password;
		}
	),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors);
		}

		bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
			const newUser = new User({
				username: req.body.username,
				password: hashedPassword,
				firstname: req.body.firstname,
				lastname: req.body.lastname,
			});

			const usernameTaken = await User.findOne({
				username: req.body.username,
			})
				.collation({ locale: "en", strength: 2 })
				.exec();

			if (usernameTaken) {
				//Error code 400 since user is taken
				return res
					.status(400)
					.json({ error: "A user with that name already exists" });
			}

			await newUser.save();
			res.json(newUser);
		});
	}),
];

exports.login = asyncHandler(async (req, res, next) => {
	// Authenticate User

	//If user is legit, create auth token for them, which we will verify on every protected route
	const user = await User.findOne({ username: req.body.username });
	if (user === null) {
		// No user found
		res.status(401).json({
			message: "Authenication Failed: Invalid username or password",
		});
	} else {
		// Compare entered password to user's pw in db
		const passwordMatch = await bcrypt.compare(
			req.body.password,
			user.password
		);

		if (passwordMatch) {
			const payload = {
				user_id: user._id,
				username: user.username,
				author: true,
			}; //change the author bool later
			const secret = process.env.SECRET;
			const options = { expiresIn: "24h", algorithm: "HS256" };
			jwt.sign(payload, secret, options, (err, token) => {
				res.json({ token: token, message: "Login Successful" });
			});
		} else {
			//passwords don't match
			res.sendStatus(401).json({
				message: "Authenication Failed: Invalid username or password",
			});
		}
	}
});
