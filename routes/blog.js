const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
	res.send("GET index, redirect to all posts");
});

router.get("/posts", (req, res) => {
	res.send("GET - read all posts");
});

router.post("/posts", (req, res) => {
	res.send("POST - create new post from body data");
});

router.get("/posts/:id", (req, res) => {
	res.send("GET - read single post by id");
});

router.put("/posts/:id", (req, res) => {
	res.send("PUT - update single post by id");
});

router.delete("/posts/:id", (req, res) => {
	res.send("DELETE - delete single post by id");
});

module.exports = router;

//NOTE: most functionality will be extracted to a controller for accessing the db
