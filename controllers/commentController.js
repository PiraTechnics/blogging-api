const Article = require("../models/article");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const jwt = require("jsonwebtoken");

/** Each controller function relates to a single post, included in the req params (url slug) */

exports.createNewComment = [
	body("content", "Comment cannot be empty").trim().notEmpty(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors);
		}

		const article = await Article.findOne({ slug: req.params.slug }).exec();
		if (!article) {
			return res.status(404).json({ error: "Blog Post not found" });
		}

		//check if user is logged in (has a token) and verify to set the currentUser obj
		const bearerHeader = req.headers["authorization"];
		if (typeof bearerHeader !== `undefined`) {
			const bearer = bearerHeader.split(" ");
			const bearerToken = bearer[1];

			if (bearerToken !== null) {
				//Verify token is valid
				jwt.verify(bearerToken, process.env.SECRET, (err, user) => {
					if (!err) {
						req.user = user;
					}
				});
			}
		}

		const newComment = {
			content: sanitizeHtml(req.body.content),
			commentor: req.user
				? sanitizeHtml(req.user.username)
				: req.body.commentor
				? sanitizeHtml(req.body.commentor)
				: "Anonymous User",
			//Checks for username from token, then from provided username, then defaults if none of the above
		};

		article.comments.push(newComment);

		const result = await article.save();
		res.redirect(result.url);
	}),
];

exports.deleteComment = asyncHandler(async (req, res, next) => {
	const article = await Article.findOne({ slug: req.params.slug }).exec();

	if (!article) {
		return res.status(404).json({ error: "Blog Post not found" });
	}

	const comment = article.comments.find(
		(entry) => entry.id.toString() === req.params.id
	);

	if (!comment) {
		return res.status(404).json({ error: "Comment not found" });
	}

	article.comments.remove(comment.id);
	await Article.findByIdAndUpdate(article.id, article);

	res.redirect(article.url);
});
