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

  $(document).on('click', 'input[type="radio"]', showCorrect)

  $(document).on('click', 'input[type="text"], textarea', removeError)
})



const submitQuiz = function(event) {
  event.preventDefault();
  const data = $(this).serialize();
  const valData = $(this).serializeArray();

  if(validateData(valData)) {
    $.post('/api', data)
  }
};

const addAnswer = function(event) {
  if (event) {
    event.preventDefault();
  }

  let currAnsID = $(this).closest('.question_form').find('.answer').last().find('label').attr('for');
  currAnsID = currAnsID.split("-");

  const question = Number(currAnsID[0]);
  const answer = Number(currAnsID[1]) + 1;

  $(this).closest('.question_form').find('.answer_container').append(`
    <div class="answer">
      <label for="${question}-${answer}">Answer ${answer}</label>
      <input type="text" name="${question}-${answer}" id="${question}-${answer}">
      <input type="radio" name="${question}-a" value="${question}-${answer}">
    </div>`)
  }

const deleteAnswer = function(event) {
  event.preventDefault();
  const $answer = $(this).closest('.question_form').find('.answer_container').children('.answer').last();

  if($answer.prev('.answer').length) {
     $answer.remove()
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
    <div class="question_form_main">
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
    <div class="question_form_foot">
    <button class="add_answer">Add Answer</button>
    <button class="delete_answer">Delete Answer</button>
    <button class="delete_question">Delete Question</button>
    </div>
    </div>
    </fieldset>`)

    $newQuestion.insertBefore('#form_foot');

    $(`#${questionNum}`).closest(`.question_form`).hide().show(400);

}

const deleteQuestion = function(event) {
  event.preventDefault();
  const $question = $(this).closest('.question_form')
  $question.hide(400, () => $question.remove())
}

const showCorrect = function(event) {
  $(this).closest('.answer_container').find('.correct').each(function () {
     $(this).removeClass('correct') });
  $(this).prev('input').addClass('correct');

  $(this).closest('.answer_container').find('span').each(function () {
      $(this).remove();
  })
  $(this).closest('.answer').find('label').append(`<span> ✅ </span>`);
};

const validateData = function(valData) {
  let countQ = 0;
  let countA = 0;

      if(valData.length <= 2) {
        $('.error_message').remove();
        $(`<div class="error_message"><p>You must have at least one question</p></div>`).insertBefore('#form_foot');
        return false;
      }

      for (let item of valData) {

        if (item.name.length === 1) {
          countQ++;
        }
        if (item.name[2] === 'a') {
          countA++;
        }

        if (!item.value.length) {
          if (item.name.length === 1) {
            $('.error_message').remove();
            $(`<div class="error_message"><p>Please fill out all the questions!</p></div>`).insertBefore('#form_foot');
            $(`#${item.name}`).addClass('invalid');
            return false;
            }
          if (item.name.length === 3) {
            $('.error_message').remove();
            $(`<div class="error_message"><p>Please ensure that no answer fields are left empty</p></div>`).insertBefore('#form_foot');
            $(`#${item.name}`).addClass('invalid');
            return false;
          }
          if (item.name.length > 3) {
            $('.error_message').remove();
            $(`<div class="error_message"><p>Please enter a title and description for your quiz</p></div>`).insertBefore('#form_foot');
            $('.error_message').hide().slideDown(200);
            $(`#${item.name}`).addClass('invalid');
            return false;
          }
        }
      }

      if (countQ !== countA) {
        $('.error_message').remove();
        $(`<div class="error_message"><p>Please select a correct answer for each question</p></div>`).insertBefore('#form_foot');
        return false;
      }


      $('.error_message').remove();
      return true;

    };

    const removeError = function() {
      $(this).removeClass('invalid');
    };



})(jQuery);
