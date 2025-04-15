# Letterboxd Clone

A movie review and rating platform built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User authentication (register/login)
- Movie browsing and details
- Movie reviews and ratings
- User profiles with watchlists
- Social features (following/followers)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd letterboxd-clone
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

4. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/letterboxd-clone
JWT_SECRET=your-secret-key
```

## Running the Application

1. Start the backend server:
```bash
npm run server
```

2. In a new terminal, start the frontend development server:
```bash
cd client
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Movies
- GET /api/movies - Get all movies
- GET /api/movies/:id - Get movie by ID
- POST /api/movies - Create a new movie
- PUT /api/movies/:id - Update a movie
- DELETE /api/movies/:id - Delete a movie

### Reviews
- GET /api/reviews - Get all reviews
- GET /api/reviews/:id - Get review by ID
- POST /api/reviews - Create a new review
- PUT /api/reviews/:id - Update a review
- DELETE /api/reviews/:id - Delete a review

## Technologies Used

- Frontend:
  - React
  - Material-UI
  - React Router
  - Axios

- Backend:
  - Node.js
  - Express.js
  - MongoDB
  - Mongoose
  - JWT Authentication

## License

MIT 