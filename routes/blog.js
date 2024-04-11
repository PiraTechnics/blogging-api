const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const userAuthorized = require("../middleware/userAuthorized");
const blogController = require("../controllers/blogController");
const commentController = require("../controllers/commentController");

/** Blog routes, posts & comments */

router.get("/", (req, res) => {
	// redirect to ALL posts for now -- note we must include full path
	res.redirect("/blog/posts");
});

router.get("/posts", blogController.getArticles);

router.post(
	"/posts",
	verifyToken,
	userAuthorized,
	blogController.createNewArticle
);

router.get("/posts/:slug", blogController.getArticle);

router.put(
	"/posts/:slug",
	verifyToken,
	userAuthorized,
	blogController.updateArticle
);

router.delete(
	"/posts/:slug",
	verifyToken,
	userAuthorized,
	blogController.deleteArticle
);

router.post("/posts/:slug/comment", commentController.createNewComment);

router.delete(
	"/posts/:slug/comment/:id",
	verifyToken,
	userAuthorized,
	commentController.deleteComment
);

module.exports = router;
