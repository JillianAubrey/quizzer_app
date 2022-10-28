const db = require('../connection');

/**
 * Gets a specific user based on their id
 * @param {String} id Id of the user to return
 * @return {Promise} Promise resolves to an object representing the user if the user exists, and null otherwise.
 * */
const getUserById = id => {
  return db.query(`
  SELECT * FROM users
  WHERE id = $1;
  `, [id])
    .then(user => {
      return (user.rows[0] || null);
    })
    .catch(error => console.log(error));
};

/**
 * Gets a specific user based on their email, for log in and registration.
 * @param {String} email Email of the user to return
 * @return {Promise} Promise resolves to an object representing the user if the user exists, and null otherwise.
 * */
const getUserByEmail = email => {
  return db.query(`
  SELECT * FROM users
  WHERE email = $1;
  `, [email])
    .then(user => {
      return (user.rows[0] || null);
    })
    .catch(error => console.log(error));
};

/**
 * Adds a new user to the db
 * @param {String} name Name of the new user
 * @param {String} email Email of the new user
 * @param {String} password Hashed password of the new user
 * @return {Promise} Promise resolves to an object representing the new user
 * */
const addUser = (name, email, password) => {
  return db.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *
  `, [name, email, password])
    .then(user => {
      return user.rows[0];
    })
    .catch(error => console.log(error));
};

module.exports = { getUserById, getUserByEmail, addUser };
