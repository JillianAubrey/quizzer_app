(($) => {

$(() => {
  $('#quiz_form').on('submit', submitQuiz)

  $('.add_answer').on('click', addAnswer)

  $('.delete_answer').on('click', deleteAnswer)

  $('.delete_question').on('click', deleteQuestion)

  $('.add_question').on('click', addQuestion)
})



const submitQuiz = function(event) {
  event.preventDefault();
  const data = $(this).serialize();
  $.post('/api', data) //then...
}

const addAnswer = function(event) {
  event.preventDefault();
  let currAnsID = $(this).prevAll('.answer_container').find('label').last().attr('for')
  currAnsID = currAnsID.split("-");
  const question = Number(currAnsID[0]);
  const answer = Number(currAnsID[1]) + 1;

  $(this).prev('.answer_container').append(`
    <div class="answer">
      <label for="${question}-${answer}">Answer ${answer}</label>
      <input type="text" name="${question}-${answer}" id="${question}-${answer}">
      <input type="radio" name="${question}-a" value="${question}-${answer}">
    </div>`)

  $(this).prev('.answer_container').children().last().hide().slideDown(400);
}

const deleteAnswer = function(event) {
  event.preventDefault();
  const $answer = $(this).prevAll('.answer_container').children('.answer').last();

  if($answer.prev('.answer').length) {
    $answer.slideUp( 400, () => $answer.remove())
    //$answer.remove();
  }
}

const deleteQuestion = function(event) {
  event.preventDefault();
  const question = $(this).closest('.question');

  
}

})(jQuery);
