const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.register = [
	// Validate user-entered data
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

		// Convert chosen password into a salted hash (automatic w/bcrypt)
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
				// Usernames must be unique
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
	// Authenticate User and generate a token (expires in 1 hr)

	const user = await User.findOne({ username: req.body.username });
	if (user === null) {
		// No user found
		res.status(401).json({
			message: "Authenication Failed: Invalid username or password",
		});
	} else {
		// Compare entered password to stored hash
		const passwordMatch = await bcrypt.compare(
			req.body.password,
			user.password
		);

		if (passwordMatch) {
			const payload = {
				user_id: user._id,
				username: user.username,
				full_name: user.full_name,
			};
			const secret = process.env.SECRET;
			const options = { expiresIn: "1h", algorithm: "HS256" };
			jwt.sign(payload, secret, options, (err, token) => {
				res.json({ token: token, message: "Login Successful" });
			});
		} else {
			// Passwords don't match
			res.sendStatus(401).json({
				message: "Authenication Failed: Invalid username or password",
			});
		}
	}
});
