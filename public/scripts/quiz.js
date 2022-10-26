$(() => {
  $('.question_card li').on('click', function() {
    selectChildRadioButton($(this));
    clearError($('.error'));
  });

  $('#quiz_submit').on('click', () => {
    submitQuiz($('.quiz_container'));
  })
});

const selectChildRadioButton = ($element) => {
  const $radioButton = $element.find('input:radio');
  const name = $radioButton.attr('name');
  $('body').find(`input:radio[name="${name}"]`).attr('checked', false)
  $radioButton.attr('checked', true);
};

const submitQuiz = ($quizContainer) => {
  const answerIds = [];

  $.each($quizContainer.find('input:checked'), (index, value) => {
    const id = Number($(value).attr('data-id'));
    answerIds.push(id);
  })

  if (answerIds.length < 1) {
    displayError('You must answer at least one question', $('.error'));
    return;
  }

  const submission = {
    quiz_id: $quizContainer.attr('data-id'),
    answerIds
  }

  $.post('/api/quiz', submission)
  .then(redirect => {
    window.location.href = redirect;
  });
};

const displayError = (message, $element) => {
  $element.text(message);
  $element.fadeIn();
};

const clearError = ($element) => {
  $element.hide();
  $element.text('');
};
