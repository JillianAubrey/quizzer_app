Quizzer App
=========

Quizzer is a full stack web application that allows users to create, take and share multiple choice quizzes.

This was a group project completed by Jeremy Buist and Jillian Aubrey as a part of our learning at [Lighthouse Labs](https://www.lighthouselabs.ca/).

## Final Product




## Dependencies
- Node 10.x or above
- NPM 5.x or above
- PG 6.x
- bcryptjs 2.x
- chalk 2.x
- cookie-session 2.x
- dotenv 2.x
- ejs 4.x
- morgan 1.x
- sass 1.x

## Getting Started
1. Clone the repository using `git clone git@github.com:JillianAubrey/quizz_app.git`
2. Create a local psql database, and a user with a password and read/write access.
3. Create a `.env` file using `.env.example` as a reference: `cp .env.example .env`
4. Update the .env file with the information feom the database/user in step 2:
  - username: `labber` 
  - password: `labber` 
  - database: `midterm`
5. Install dependencies: `npm i`
6. Fix to binaries for sass: `npm rebuild node-sass`
7. Reset database: `npm run db:reset`
8. Run the server: `npm run start`
9. Visit `http://localhost:8080/`
