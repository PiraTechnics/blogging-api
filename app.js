const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const authRouter = require("./routes/auth");
const blogRouter = require("./routes/blog");

// Setup Routes and JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); //CORS enabled for all origins -- NOTE: change this for deployment

app.use("/auth", authRouter);
app.use("/blog", blogRouter);

// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// Send an error message
	res.status(err.status || 500);
	res.json({ status: err.status, message: err.message });
});

// Start server, listening on specified in our ENV
app.listen(process.env.PORT, () =>
	console.log(`Example app listening on port ${process.env.PORT}!`)
);
