const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config;

mongoose.connect(process.env.DB_STRING);

const CommentSchema = new Schema({
	content: { type: String, required: true, default: "" },
	datePosted: { type: Date, default: Date.now },
	commentor: { type: String, required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);
