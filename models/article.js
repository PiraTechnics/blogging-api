const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();
const User = require("./user");

mongoose.connect(process.env.DB_STRING);

const ArticleSchema = new Schema({
	title: { type: String, required: true, unique: true },
	text: { type: String, required: true, default: "" },
	author: { type: Schema.Types.ObjectId, ref: User, required: true },
	datePosted: { type: Date, default: Date.now },
	dateUpdated: { type: Date, default: Date.now },
	published: { type: Boolean, default: false }, //will need a way to update this/set it manually
});

//Do we need this for the API?
BlogpostSchema.virtual("url").get(function () {
	return `/api/posts/${this._id}`;
});

module.exports = mongoose.model("Article", ArticleSchema);
