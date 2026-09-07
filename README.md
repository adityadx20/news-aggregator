# News Aggregator API

A simple REST API built using Node.js and Express.js for getting personalized news.

Users can:
- Create an account
- Login using email and password
- Add and update news preferences
- Get personalized news
- Search news using a keyword
- Mark articles as read
- Mark articles as favorite
- View read and favorite articles

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- Axios
- GNews API

## Project Structure

news-aggregator-api/

- authorization/
  - auth.js
- models/
  - User.js
- routes/
  - userRoutes.js
  - newsRoutes.js
- services/
  - newsService.js
- test/
  - server.test.js
- app.js
- package.json
- package-lock.json
- .env
- .gitignore

## Authentication

JWT is used to protect user-specific APIs.

After login, the user gets a JWT token.

Send the token with protected requests:

Authorization: Bearer <token>

Passwords are hashed using bcrypt before they are stored.

## API Endpoints

User APIs:

POST /users/signup
Creates a new user.

POST /users/login
Logs in the user and returns a JWT token.

GET /users/preferences
Returns the user's news preferences.

PUT /users/preferences
Updates the user's news preferences.

News APIs:

GET /news
Returns news based on the user's preferences.

GET /news/search/:keyword
Searches for news using a keyword.

Read Article APIs:

POST /news/:id/read
Marks an article as read.

GET /news/read
Returns all read articles.

Favorite Article APIs:

POST /news/:id/favorite
Marks an article as favorite.

GET /news/favorites
Returns all favorite articles.

Protected APIs require a valid JWT token.

## Data Storage

MongoDB is used to store user data through Mongoose.

User data includes:
- User details
- Hashed password
- News preferences
- Read articles
- Favorite articles

The data is stored in MongoDB and remains available after the server is restarted.

## Caching

News results are cached using a JavaScript Map.

The cache is used for personalized news and news search.

The cache is valid for 5 minutes to reduce repeated calls to the GNews API.

## Error Handling

The API handles:
- Invalid input
- Invalid login details
- Invalid or missing JWT token
- Duplicate email
- Article not found
- GNews API errors
- Rate limit errors

The API returns appropriate HTTP status codes for these errors.

## Setup

Install the required packages:

npm install

Create a .env file:

GNEWS_API_KEY=your_gnews_api_key
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

Start the server:

node app.js

The server runs at:

http://localhost:3000

## Testing

Run the tests using:

node test/server.test.js