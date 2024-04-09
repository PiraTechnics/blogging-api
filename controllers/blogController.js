const Article = require("../models/article");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.getAllArticles = asyncHandler(async (req, res, next) => {
	const allArticles = await Article.find().sort({ datePosted: 1 }).exec();
	res.json(allArticles);
});

exports.getArticle = asyncHandler(async (req, res, next) => {
	const article = await Article.findOne({ slug: req.params.slug }) //Slugs should be unique
		.populate("author", "username")
		.exec();
	if (!article) {
		return res.status(404).json({ error: "Blog Post not found" });
	}
	res.json(article);
});

exports.createNewArticle = [
	body("title", "Title cannot be empty").trim().notEmpty(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors);
		}

		const titleExists = await Article.findOne({
			title: req.body.title,
		})
			.collation({ locale: "en", strength: 2 })
			.exec();

		if (titleExists) {
			return res
				.status(400)
				.json({ error: "Blog Post with title already exists" });
		}

		const newPost = new Article({
			title: req.body.title,
			content: req.body.content,
			author: req.user.user_id,
			published: true,
		});

		const result = await newPost.save();
		//console.log(result);
		res.redirect(newPost.url);
		// Redirect to route that calls getArticle
	}),
];

exports.updateArticle = asyncHandler(async (req, res, next) => {});

exports.deleteArticle = asyncHandler(async (req, res, next) => {});
