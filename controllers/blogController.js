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
		.populate("comments")
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

		const newArticle = new Article({
			title: req.body.title,
			content: req.body.content,
			author: req.user.user_id,
			published: req.body.publish,
		});

		const result = await newArticle.save();
		res.redirect(result.url);
	}),
];

exports.updateArticle = [
	body("title", "Title cannot be empty").trim().notEmpty(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors);
		}

		const article = await Article.findOne({ slug: req.params.slug }).exec();

		if (!article) {
			//Article doesn't exist to begin with
			return res.status(404).json({ error: "Blog Post Not Found" });
		}

		// Only authors of an article can update it
		if (article.author.toString() !== req.user.user_id) {
			console.log(req.user.user_id);
			console.log(oldArticle.author.toString());
			return res
				.status(403)
				.json({ error: "You are not authorized to update Blog Post" });
		}

		article.title = req.body.title;
		article.content = req.body.content;
		article.published = req.body.publish;
		article.dateUpdated = Date.now();

		const result = await article.save();
		res.redirect(result.url); // Redirect to updated Blog Post
	}),
];

exports.deleteArticle = asyncHandler(async (req, res, next) => {
	const article = await Article.findOne({ slug: req.params.slug }).exec();

	if (!article) {
		//Article doesn't exist to begin with
		return res.status(404).json({ error: "Blog Post Not Found" });
	}

	// Only authors of an article can delete it
	if (article.author.toString() !== req.user.user_id) {
		return res
			.status(403)
			.json({ error: "You are not authorized to delete Blog Post" });
	}

	await Article.findOneAndDelete({ slug: req.params.slug });
	res.redirect("/blog"); // Redirect to home after deleting
});
