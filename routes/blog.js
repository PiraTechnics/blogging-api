const express = require("express");
const router = express.Router();

/** Blog routes, posts & comments */

router.get("/", (req, res) => {
	// redirect to ALL posts for now -- note we must include full path
	res.redirect("/blog/posts");
});

router.get("/posts", (req, res) => {
	res.send("GET - read all posts");
});

router.post("/posts", (req, res) => {
	res.send("POST - create new post from body data");
});

router.get("/posts/:id", (req, res) => {
	//res.send("GET - read single post by id");
	res.send(`GET for post ${req.params.id}`);
});

router.put("/posts/:id", (req, res) => {
	res.send("PUT - update single post by id");
});

router.delete("/posts/:id", (req, res) => {
	res.send("DELETE - delete single post by id");
});

module.exports = router;

//NOTE: most functionality will be extracted to a controller for accessing the db
