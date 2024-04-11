const Comment = require("../models/comment");
const Article = require("../models/article");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

/** Each controller function relates to a single post, included in the req params (url slug) */

exports.createNewComment = [
	body("content", "Comment cannot be empty").trim().escape().notEmpty(),
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

		const newComment = new Comment({
			content: req.body.content,
			commentor: req.user ? req.user.username : "Anonymous User",
		});

		const result = await newComment.save();
		article.comments.push(result.id); //Add newly saved comment to article's comments array
		await Article.findByIdAndUpdate(article.id, article); //update in mongodb

		res.redirect(article.url);
	}),
];

exports.deleteComment = asyncHandler(async (req, res, next) => {
	const [article, comment] = await Promise.all([
		Article.findOne({ slug: req.params.slug }).exec(),
		Comment.findById(req.params.id).exec(),
	]);

	if (!article || !comment) {
		return res.status(404).json({ error: "Blog Post or Comment not found" });
	}

	//remove both comment and ref to it in the article
	article.comments.remove(comment.id);
	await Promise.all([
		Article.findByIdAndUpdate(article.id, article),
		Comment.findByIdAndDelete(comment.id),
	]);

	res.redirect(article.url);
});
