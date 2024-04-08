const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const blogRouter = require("./routes/blog");

// Setup Routes and JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use("/api/blog", blogRouter);

// Start server, listening on specified in our ENV
app.listen(process.env.PORT, () =>
	console.log(`Example app listening on port ${process.env.PORT}!`)
);
