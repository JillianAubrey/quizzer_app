//file for API queries (may share some functionality with db/users.js but trying to modularize).

const db = require('../connection'); //connect to DB



const getQuizzes = (options) => {
  let query = `
  SELECT quizzes.*, COUNT(questions.*) as question_count
  FROM quizzes
  LEFT JOIN questions
    ON quizzes.id = quiz_id
  WHERE TRUE
  `; // WHERE TRUE initiates the WHERE so the filter options can be added with AND

  if (options.public) {
    query += ' AND NOT is_private';
  }

  query += ' GROUP BY quizzes.id;'

  return db.query(query, [])
  .then (data => {
    return data.rows;
  })
  .catch(error => {
    console.log(error);
  })
}


module.exports = { getQuizzes }; //nothing to export..yet
