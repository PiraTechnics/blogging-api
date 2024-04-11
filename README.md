# blogging-api

Node &amp; Express-based API for blogging

## Setup & Local Development

Prerequisities:

- MongoDB cluster (local or remote). For development purposes, MongoDB Atlas free cluster is sufficient: https://www.mongodb.com/atlas/database

- .env local variables:
  - PORT (Port for server to run on, 3000 is default for Express)
  - DB_STRING (MongoDB driver connection string, for use with Mongoose)
  - SECRET (Password hashing secret string, for use with bcryptJS)
  - ADMIN_CODE (Authorization code for enabling blog authorship in account signup)

Setup & Installation

1. Clone/Fork repository and cd into directory
2. run `npm install` to install all dependencies
3. Create .env file `touch .env` and fill in local variables
4. Ensure MongoDB instance is running
5. Run server with `npm run dev`

## Acknowledgements

Written for Project: Blog API, _The Odin Project_: https://www.theodinproject.com/lessons/nodejs-blog-api

Thanks to the tireless community of developers and teachers for all you do.
