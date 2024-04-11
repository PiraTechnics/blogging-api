const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();
const User = require("./user");
//const Comment = require("./comment");
const slugify = require("slugify");

mongoose.connect(process.env.DB_STRING);

const CommentSchema = new Schema({
	content: { type: String, required: true, default: "" },
	datePosted: { type: Date, default: Date.now },
	commentor: { type: String, required: true },
});

const ArticleSchema = new Schema({
	title: { type: String, required: true, unique: true },
	content: { type: String, required: true, default: "" },
	author: { type: Schema.Types.ObjectId, ref: User, required: true },
	datePosted: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now },
	published: { type: Boolean, default: false }, //NOTE: will need a way to update this/set it manually
	slug: { type: String, unique: true, default: "" },
	comments: [CommentSchema],
});

ArticleSchema.pre("save", async function (next) {
	const articleSlug = slugify(this.title, {
		replacement: "-",
		lower: true,
		strict: true,
		locale: "en",
	});

	if (articleSlug !== this.slug) {
		//Only run if slug needs updating
		const slugExists = await this.constructor
			.findOne({ slug: articleSlug })
			.exec();
		if (slugExists) {
			const err = new Error("Article with with url already exists");
			err.status = 401;
			next(err);
		}

		this.slug = articleSlug;
		//console.log(`Slug Created: ${this.slug}`);
	}

	next();
});

ArticleSchema.virtual("url").get(function () {
	return `/blog/posts/${this.slug}`;
});

module.exports = mongoose.model("Article", ArticleSchema);
