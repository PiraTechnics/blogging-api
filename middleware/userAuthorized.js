// Middleware function to check if user is an author (and therefore allowed to post/edit/delete)
const userAuthorized = (req, res, next) => {
	if (req.user.admin) {
		next();
	} else {
		return res.status(403).json({ error: "User is not an author" });
	}
};

module.exports = userAuthorized;
