const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();
const User = require("./user");
const slugify = require("slugify");

mongoose.connect(process.env.DB_STRING);

const ArticleSchema = new Schema({
	title: { type: String, required: true, unique: true }, //Note: Should this be sanitized (ie no special characters?)
	content: { type: String, required: true, default: "" },
	author: { type: Schema.Types.ObjectId, ref: User, required: true },
	datePosted: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now },
	published: { type: Boolean, default: false }, //will need a way to update this/set it manually
	slug: { type: String, unique: true, default: "" },
});

ArticleSchema.pre("save", async function (next) {
	const user = this;
	user.slug = slugify(this.title, {
		replacement: "-",
		lower: true,
		strict: true,
		locale: "en",
	});

	//Check if slug already exists for an entry
	const slugExists = await this.constructor.findOne({ slug: this.slug }).exec();
	if (slugExists) {
		const err = new Error("Blog with with url already exists");
		err.status = 401;
		next(err);
	}

	next();
});

ArticleSchema.virtual("url").get(function () {
	return `/blog/posts/${this.slug}`;
});

module.exports = mongoose.model("Article", ArticleSchema);
