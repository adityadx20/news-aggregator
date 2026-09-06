# News Aggregator API

A simple REST API built using Node.js and Express.js for getting personalized news.

Users can:

- Create an account
- Login using email and password
- Add and update news preferences
- Get news based on their preferences
- Search news using a keyword
- Mark articles as read
- Mark articles as favorite
- View read and favorite articles

## Tech Stack

- Node.js
- Express.js
- JWT
- bcrypt
- Axios
- GNews API

## Project Structure

```text
news-aggregator-api/
│
├── authorization/
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
```

## Authentication

JWT is used to protect the user-specific APIs.

After login, the user gets a token. This token must be sent with protected requests:

```text
Authorization: Bearer <token>
```

Passwords are hashed using bcrypt before they are stored.

## User APIs

### Signup

```text
POST /users/signup
```

Creates a new user.

The API checks:

- Name, email and password are provided
- Email format is valid
- Password has at least 8 characters
- Preferences are provided as an array
- Email is not already registered

### Login

```text
POST /users/login
```

Logs the user in and returns a JWT token.

Wrong email or password returns `401`.

## Preferences

### Get Preferences

```text
GET /users/preferences
```

Returns the preferences of the logged-in user.

### Update Preferences

```text
PUT /users/preferences
```

Updates the user's news preferences.

These APIs require a valid JWT token.

## News APIs

### Get Personalized News

```text
GET /news
```

Returns news based on the user's preferences.

### Search News

```text
GET /news/search/:keyword
```

Searches for news using the given keyword.

Both APIs require authentication.

## Read Articles

### Mark Article as Read

```text
POST /news/:id/read
```

Marks an article as read for the logged-in user.

### Get Read Articles

```text
GET /news/read
```

Returns all articles marked as read.

## Favorite Articles

### Mark Article as Favorite

```text
POST /news/:id/favorite
```

Marks an article as favorite.

### Get Favorite Articles

```text
GET /news/favorites
```

Returns all favorite articles.

The application stores the complete article details in the read and favorite lists.

## Caching

News results are cached using a JavaScript `Map`.

The cache is used for:

- Personalized news
- News search

The cache is valid for 5 minutes. This helps reduce repeated calls to the GNews API.

## Error Handling

The API handles common errors such as:

- Missing or invalid input
- Invalid login details
- Missing or invalid JWT token
- Duplicate email
- Article not found
- GNews API errors
- Rate limit errors

Appropriate HTTP status codes such as `400`, `401`, `404`, `409`, `429`, `502` and `500` are returned.

## Data Storage

This project uses an **in-memory array** to store user data.

No database such as MongoDB is used.

User data includes:

- User details
- Password hash
- News preferences
- Read articles
- Favorite articles

Since the data is stored in memory, all data will be lost when the server is restarted.

## Setup

Install the required packages:

```bash
npm install
```

Create a `.env` file:

```env
GNEWS_API_KEY=your_gnews_api_key
```

Start the server:

```bash
node app.js
```

The server runs on:

```text
http://localhost:3000
```

