(($) => {

$(() => {

  addQuestion();
  addQuestion();
  addQuestion();

  $('#quiz_form').on('submit', submitQuiz);

  $(document).on('click', '.add_answer', addAnswer);

  $(document).on('click', '.delete_answer', deleteAnswer);

  $(document).on('click', '.delete_question', deleteQuestion);

  $(document).on('click', '.add_question', addQuestion);
})



const submitQuiz = function(event) {
  event.preventDefault();
  const data = $(this).serialize();
  $.post('/api', data) //then...
}

const addAnswer = function(event) {
  if (event) {
    event.preventDefault();
  }

  let currAnsID = $(this).prevAll('.answer_container').find('label').last().attr('for');
  currAnsID = currAnsID.split("-");

  const question = Number(currAnsID[0]);
  const answer = Number(currAnsID[1]) + 1;

  $(this).prev('.answer_container').append(`
    <div class="answer">
      <label for="${question}-${answer}">Answer ${answer}</label>
      <input type="text" name="${question}-${answer}" id="${question}-${answer}">
      <input type="radio" name="${question}-a" value="${question}-${answer}">
    </div>`)

  $(this).prevAll('.answer_container').children().last().hide().slideDown(400);
}

const deleteAnswer = function(event) {
  event.preventDefault();
  const $answer = $(this).prevAll('.answer_container').children('.answer').last();

  if($answer.prev('.answer').length) {

    $answer.slideUp( 400, () => $answer.remove())

  }
}

const addQuestion = function(event) {
  if (event) {
    event.preventDefault();
  }
  const questionNum = Number($('#quiz_form').find('.question').last().attr('id')) + 1 || 1;

  const $newQuestion = $(`
    <fieldset class="question_form">
    <legend>Question ${questionNum}</legend>
    <textarea class="question" name="${questionNum}" id="${questionNum}" placeholder="Your question here..."></textarea>
    <div class="answer_container">

      <div class="answer">
        <label for="${questionNum}-1">Answer 1</label>
        <input type="text" name="${questionNum}-1" id="${questionNum}-1">
        <input type="radio" name="${questionNum}-a" value="${questionNum}-1">
      </div>
      <div class="answer">
        <label for="${questionNum}-2">Answer 2</label>
        <input type="text" name="${questionNum}-2" id="${questionNum}-2">
        <input type="radio" name="${questionNum}-a" value="${questionNum}-2">
      </div>
      <div class="answer">
        <label for="${questionNum}-3">Answer 3</label>
        <input type="text" name="${questionNum}-3" id="${questionNum}-3">
        <input type="radio" name="${questionNum}-a" value="${questionNum}-3">
      </div>
    </div>
    <button class="add_answer">Add Answer</button>
    <button class="delete_answer">Delete Answer</button>
    <button class="delete_question">Delete Question</button>
    </fieldset>`)

    $newQuestion.insertBefore('#form_foot');

    $(`#${questionNum}`).closest(`.question_form`).hide().show(400);

}

const deleteQuestion = function(event) {
  event.preventDefault();
  const $question = $(this).closest('.question_form')
  $question.slideUp(400, () => $question.remove())
}

})(jQuery);
