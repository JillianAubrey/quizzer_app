(($) => {

  $(() => {

    //adds three questions to the form on load
    addQuestion();
    addQuestion();
    addQuestion();

    //validates the input and submits the form if the checks pass
    $('#quiz_form').on('submit', submitQuiz);

    //adds an answer input to a question form
    $(document).on('click', '.add_answer', addAnswer);

    //deletes an answer input in a question form
    $(document).on('click', '.delete_answer', deleteAnswer);

    //deletes a question form in the quiz form
    $(document).on('click', '.delete_question', deleteQuestion);

    //adds a question form to the quiz form
    $(document).on('click', '.add_question', addQuestion);

    //displays visual elements when the user selects what the correct answer to their question is
    $(document).on('click', 'input[type="radio"]', showCorrect);

    //removes validation error styling when the user re-enters the form input text area
    $(document).on('click', 'input[type="text"], textarea', removeError);
  });


  
  const submitQuiz = function(event) {
    event.preventDefault();
    const data = $(this).serialize();
    const valData = $(this).serializeArray();

    if (validateData(valData)) {
      $.post('/api/quiz', data).then((res) => {
        renderConfirmation(res);
      });
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
    </div>`);
  };

  const deleteAnswer = function(event) {
    event.preventDefault();
    const $answer = $(this).closest('.question_form').find('.answer_container').children('.answer').last();

    if ($answer.prev('.answer').length) {
      $answer.remove();
    }
  };

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
    </fieldset>`);

    $newQuestion.insertBefore('#form_foot');

    $(`#${questionNum}`).closest(`.question_form`).hide().show(400);

  };

  const deleteQuestion = function(event) {
    event.preventDefault();
    const $question = $(this).closest('.question_form');
    $question.hide(400, () => $question.remove());
  };

  const showCorrect = function(event) {
    $(this).closest('.answer_container').find('.correct').each(function() {
      $(this).removeClass('correct');
    });
    $(this).prev('input').addClass('correct');

    $(this).closest('.answer_container').find('span').each(function() {
      $(this).remove();
    });
    $(this).closest('.answer').find('label').append(`<span> ✅ </span>`);
  };

  const validateData = function(valData) {
    let countQ = 0;
    let countA = 0;
    let pubPriv = 0;

    if (valData.length <= 3) {
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

      if (item.name === 'quiz_private') {
        pubPriv = 1;
      }

      if (item.name === 'quiz_description' || item.name === 'quiz_title') {
        if (item.value.length > 255) {
          $('.error_message').remove();
          $(`<div class="error_message"><p>Title and description should be 255 characters or less</p></div>`).insertBefore('#form_foot');
          $(`#${item.name}`).addClass('invalid');
          return false;
        }
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

    if (pubPriv === 0) {
      $('.error_message').remove();
      $(`<div class="error_message"><p>Please choose whether your quiz will be public or private</p></div>`).insertBefore('#form_foot');
      return false;
    }


    $('.error_message').remove();
    return true;

  };

  const removeError = function() {
    $(this).removeClass('invalid');
  };

  const renderConfirmation = function(data) {
    let visibility;
    if (data.quizPrivate === 'FALSE') {
      visibility = 'public';
    } else {
      visibility = 'private';
    }

    let $confPage = `<article>
        <h3>Congratulations <span class="conf_user">${data.userName}</span>! Your new <span class="conf_private">${visibility}</span> quiz "<span class=".conf_title">${data.quizTitle}</span>" was successfully created. 🥳</h3>
        <div class="copy_buttons">
          <button class="quizlink_button c_b"><span>Copy Quiz Link</span>&nbsp;<input class="copy_input" value=http://localhost:8080/quizapp/quiz/${data.url}></button>
          <button class="resultslink_button c_b"><span>Copy Results Link </span> &nbsp;<input class="copy_input" value=http://localhost:8080/quizapp/quiz/results/${data.resultsUrl}></button>
        </div>
      </article>`;

    $('h1').html('Quiz Created');
    $('form').remove();
    $('main').addClass('confirmation');
    $('main').append($confPage);

    $(document).on('click', '.c_b', function() {
      $(this).find('input').select();
      document.execCommand('copy');

      let $text = $(this).find('span').text();
      $(this).find('span').text("Link Copied!");

      setTimeout(() => {
        $(this).find('span').text($text);
      }, 2000);

    });


  };

})(jQuery);
