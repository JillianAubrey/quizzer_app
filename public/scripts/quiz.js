$(() => {
  $('.question_card li').on('click', function() {
    selectChildRadioButton($(this))
  });

  $('#quiz_submit').on('click', () => {
    submitQuiz($('.quiz_container'));
  })
});

const selectChildRadioButton = ($element) => {
  $element.parent().find('input:radio').attr('checked', false)
  $element.find('input:radio').attr('checked', true);
};

const submitQuiz = ($quizContainer) => {
  const answerIds = [];

  $.each($quizContainer.find('input:checked'), (index, value) => {
    const id = Number($(value).attr('data-id'));
    answerIds.push(id);
  })

  const submission = {
    quiz_id: $quizContainer.attr('data-id'),
    answerIds
  }

  console.log(submission);
  // Once route exists, add code here to post the answerIds
};
