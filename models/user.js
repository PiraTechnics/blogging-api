const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("dotenv").config();

mongoose.connect(process.env.DB_STRING);

const UserSchema = new Schema({
	username: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	firstname: { type: String, required: true },
	lastname: { type: String, required: true },
	admin: { type: Boolean, required: true, default: false }, //authorization for creating, updating, deleting posts, as well as moderating comments.
});

module.exports = mongoose.model("User", UserSchema);
