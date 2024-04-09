const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const blogController = require("../controllers/blogController");

/** Blog routes, posts & comments */

router.get("/", (req, res) => {
	// redirect to ALL posts for now -- note we must include full path
	res.redirect("/blog/posts");
});

router.get("/posts", blogController.getAllArticles);

router.post("/posts", verifyToken, blogController.createNewArticle);

router.get("/posts/:slug", blogController.getArticle);

router.put("/posts/:slug", (req, res) => {
	res.send("PUT - update single post by slug (url identifier)");
});

router.delete("/posts/:slug", (req, res) => {
	res.send("DELETE - delete single post by slug (url identifier)");
});

module.exports = router;

//NOTE: most functionality will be extracted to a controller for accessing the db
