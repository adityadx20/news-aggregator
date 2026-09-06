# News Aggregator API

A REST API built using Node.js and Express for a personalized news aggregator.

The API allows users to:

- Create an account
- Login using email and password
- Store and update news preferences
- Get news based on their preferences
- Access protected endpoints using JWT authentication

## Tech Stack

- Node.js
- Express.js
- JWT
- bcrypt
- GNews API


## Project Structure

```text
news-aggregator-api/
│
├── middleware/
│   └── auth.js
│
├── routes/
│   ├── userRoutes.js
│   └── newsRoutes.js
│
├── services/
│   └── newsService.js
│
├── test/
│   └── server.test.js
│
├── app.js
├── package.json
├── package-lock.json
├── .env
└── .gitignore

## Data Storage

This project uses an **in-memory array** for storing user data instead of a persistent database such as MongoDB.

The users are stored in an array during the lifetime of the server:

- User signup data is stored in memory.
- User login and authentication use the in-memory user data.
- User preferences are stored and updated in memory.
- No external database is required to run the application.

### Why In-Memory Storage?

For this assignment, I chose an in-memory implementation to keep the application simple and focused on the core backend requirements such as:

- REST API design
- Authentication and authorization
- Password hashing with bcrypt
- JWT-based authentication
- User preference management
- Personalized news retrieval
- API error handling
- News API caching

**Note:** Since the data is stored in memory, all users and their preferences are cleared when the server is restarted. 
