const Article = require("../models/article");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const sanitizeHtml = require("sanitize-html");
const createError = require("http-errors");

exports.getArticles = asyncHandler(async (req, res, next) => {
	//allow filtering and pagination
	const limit = parseInt(req.query.limit) || 0;
	const order = req.query.order || -1;

	const articles = await Article.find({ published: true })
		.sort({ datePosted: order === "asc" ? 1 : -1 })
		.populate("author", "firstname lastname")
		.limit(limit)
		.exec();
	res.json(articles);
});

exports.getAllArticles = asyncHandler(async (req, res, next) => {
	//allow filtering and pagination
	const limit = parseInt(req.query.limit) || 0;
	const order = req.query.order || -1;

	//limit the articles shown to the logged-in author (can only see/edit own posts in dashboard)
	const articles = await Article.find({ author: req.user.user_id })
		.sort({ datePosted: order === "asc" ? 1 : -1 })
		.limit(limit)
		.exec();
	res.json(articles);
});

exports.getArticle = asyncHandler(async (req, res, next) => {
	const article = await Article.findOne({
		slug: req.params.slug,
		published: true,
	}) //Slugs should be unique
		.populate("author", "username")
		.exec();
	if (!article) {
		const err = next(createError(404, "Blog Post not found"));
		next(err);
	} else {
		res.json(article);
	}
});

exports.createNewArticle = [
	body("title", "Title cannot be empty").trim().notEmpty(),
	asyncHandler(async (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			//NOTE: should we use createError here on each, or leave as is?
			return res.status(400).json(errors);
		}

		const titleExists = await Article.findOne({
			title: req.body.title,
		})
			.collation({ locale: "en", strength: 2 })
			.exec();

		if (titleExists) {
			const err = createError(400, "Blog Post with title already exists");
			next(err);
		} else {
			const newArticle = new Article({
				title: req.body.title,
				content: sanitizeHtml(req.body.content),
				author: req.user.user_id,
				published: req.body.published,
			});

			const result = await newArticle.save();
			res.redirect(result.url);
		}
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
			const err = createError(404, "Blog Post Not Found");
			next(err);
		}

		// Only authors of an article can update it
		if (article.author.toString() !== req.user.user_id) {
			console.log(req.user.user_id);
			console.log(article.author.toString());

			const err = createError(
				403,
				"You are not authorized to update Blog Post"
			);
			next(err);
		}

		const updatedArticle = new Article({
			title: req.body.title,
			content: sanitizeHtml(req.body.content),
			author: req.user.user_id,
			published: req.body.published,
			datePosted: article.datePosted,
			dateUpdated: Date.now(),
			slug: article.slug,
			comments: article.comments,
			_id: article.id,
		});

		const result = await Article.findByIdAndUpdate(article.id, updatedArticle);
		res.json(result);
	}),
];

exports.deleteArticle = asyncHandler(async (req, res, next) => {
	const article = await Article.findOne({ slug: req.params.slug }).exec();

	if (!article) {
		//Article doesn't exist to begin with
		const err = createError(404, "Blog Post Not Found");
		next(err);
	}

	// Only authors of an article can delete it
	if (article.author.toString() !== req.user.user_id) {
		const err = createError(403, "You are not authorized to delete Blog Post");
		next(err);
	}

	await Article.findOneAndDelete({ slug: req.params.slug });
	res.redirect("/blog"); // Redirect to home after deleting
	//Note: We should probaly just be returning confirmations, not doing actual redirects in the API. For future thought
});
