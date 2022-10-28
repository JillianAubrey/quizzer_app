$(() => {
  //Selects answer on click, and clears submit error if it exists
  $('.question_card li').on('click', function() {
    selectChildRadioButton($(this));
    clearSubmitError($('#error'));
  });

  //Posts attempt to server
  $('#quiz_submit').on('click', () => {
    submitQuiz($('.quiz_container'));
  });
});

/**
 * Select the child radio button of passed $element, and unselect other radio buttons in the group.
 * @param {jquery$element} $element The element containing the radio button.
 * @return {none}
 */
const selectChildRadioButton = ($element) => {
  const $radioButton = $element.find('input:radio');
  const name = $radioButton.attr('name');
  $('body').find(`input:radio[name="${name}"]`).attr('checked', false);
  $radioButton.attr('checked', true);
};

/**
 * POST selected answers as a quiz attempt, then redirect to attempt page.
 * @param {jquery$element} $quizContainer The element containing the quiz.
 * @return {none}
 */
const submitQuiz = ($quizContainer) => {
  const answerIds = [];

  $.each($quizContainer.find('input:checked'), (index, input) => {
    const id = Number($(input).attr('data-id'));
    answerIds.push(id);
  });

  if (answerIds.length < 1) {
    displaySubmitError('You must answer at least one question', $('#quiz_submit'));
    return;
  }

  const submission = {
    quiz_id: $quizContainer.attr('data-id'),
    answerIds
  };

  $.post('/api/quiz/attempt', submission)
    .then(redirect => {
      window.location.href = redirect;
    });
};

/**
 * Tranforms submit button into an error, with given message
 * @param {String} message The error message to display.
 * @param {jquery$element} $element The submit button element.
 * @return {none}
 */
const displaySubmitError = (message, $element) => {
  $element.text(message);
  $element.attr('id','error');
  setTimeout(() => {
    clearSubmitError($element);
  }, 3000);
};

/**
 * Transforms error message back into submit button
 * @param {jquery $element} $element The submit button element.
 * @return {none}
 */
const clearSubmitError = ($element) => {
  $element.removeAttr('id','error');
  $element.attr('id','quiz_submit');
  $element.html('Submit');
};
