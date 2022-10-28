(($) => {

  $(() => {

    //adds three questions to the form on load
    for (let i = 0; i < 3; i++) {
      addQuestion();
    }

    //validates the input and submits the form if the checks pass
    $('#quiz_form').on('submit', function(event) {
      event.preventDefault();
      submitQuiz($(this));
    });

    //adds an answer input to a question form
    $(document).on('click', '.add_answer', function(event) {
      event.preventDefault();
      addAnswer($(this).closest('.question_form'));
    });

    //deletes an answer input in a question form
    $(document).on('click', '.delete_answer', function(event) {
      event.preventDefault();
      deleteLast($(this).closest('.question_form'), '.answer');
    });

    //deletes a question form in the quiz form
    $(document).on('click', '.delete_question', function(event) {
      event.preventDefault();
      deleteElementAnimate($(this).closest('.question_form'));
    });

    //adds a question form to the quiz form
    $(document).on('click', '.add_question', function(event) {
      event.preventDefault();
      addQuestion();
    });

    //displays visual elements when the user selects what the correct answer to their question is
    $(document).on('click', 'input[type="radio"]', function() {
      formatCorrect($(this).closest('.answer'));
    });

    //removes validation error styling when the user re-enters the form input text area
    $(document).on('click', 'input[type="text"], textarea', function() {
      removeError($(this));
    });
  });

  /**
 * Add an answer field to a question form
 * @param {jQueryElement} $questionForm The question form element
 * @return {none} none
 */
  const addAnswer = function($questionForm) {
    let answerId = 1;
    const questionId = $questionForm.find('.question').attr('id');
    const prevAnswerId = $questionForm.find('.answer').last().find('label').attr('for') || null;

    if (prevAnswerId) {
      answerId = Number(prevAnswerId.split("-")[1]) + 1;
    }

    $questionForm.find('.answer_container').append(`
    <div class="answer">
      <label for="${questionId}-${answerId}">Answer ${answerId}</label>
      <input type="text" name="${questionId}-${answerId}" id="${questionId}-${answerId}">
      <input type="radio" name="${questionId}-a" value="${questionId}-${answerId}">
    </div>`);
  };

  /**
   * Deletes the last element in $parentElement that matches selector
   * @param {jQueryElement} $parentElement The target element, contains the element to be deleted.
   * @param {String} selector jQuery compatible selector that targets element to be deleted.
   * @return {none} none
   */
  const deleteLast = ($parentElement, selector) => {
    const $last = $parentElement.find(selector).last() || null;
    if ($last) {
      deleteElementAnimate($last);
    }
  };

  /**
   * Add a question to the quiz_form
   * @return {none} none
   */
  const addQuestion = function() {
    const questionNum = Number($('#quiz_form').find('.question').last().attr('id')) + 1 || 1;

    const $newQuestion = $(`
    <fieldset class="question_form">
    <legend>Question ${questionNum}</legend>
    <div class="question_form_main">
    <textarea class="question" name="${questionNum}" id="${questionNum}" placeholder="Your question here..."></textarea>
    <div class="answer_container">
    </div>
    <div class="question_form_foot">
    <button class="add_answer">Add Answer</button>
    <button class="delete_answer">Delete Answer</button>
    <button class="delete_question">Delete Question</button>
    </div>
    </div>
    </fieldset>`);

    for (let i = 0; i < 4; i++) {
      addAnswer($newQuestion);
    }

    $newQuestion.insertBefore('#form_questions');

    $(`#${questionNum}`).closest(`.question_form`).hide().show(400);

  };

  /**
   * Deletes $element with an animation
   * @param {jQueryElement} $element Element to delete.
   * @return {none} none
   */
  const deleteElementAnimate = function($element) {
    $element.hide(400, () => $element.remove());
  };

  /**
   * Format $answer as the correct answer for its question, and remove correct answering formatting from other answers on the question.
   * @param {jQueryElement} $answer The element that is the correct answer.
   * @return {none} none
   */
  const formatCorrect = function($answer) {
    const $answerContainer = $answer.closest('.answer_container');

    $answerContainer.find('.correct').removeClass('correct');
    $answer.children('input[type="text"]').addClass('correct');

    $answerContainer.find('span').remove();
    $answer.append(`<span> ✅ </span>`);
  };

  /**
 * POST selected answers as a quiz attempt, then redirect to attempt page.
 * @param {jQueryElement} $quizForm The form element containing the quiz
 * @return {none} none
 */
  const submitQuiz = function($quizForm) {
    const data = $quizForm.serializeArray();
    const quiz = createQuizObj(data);
    if (quiz) {
      $.post('/api/quiz', JSON.stringify(quiz)).then((res) => {
        console.log(res);
        renderConfirmation(res, quiz);
      });
    }
  };

  /**
 * Format quiz_form into a quiz object and perform validation
 * @param {array} data The array containing all of the quiz_form data.
 * @return {quizObject} Returns the quiz object if all validation is met (if validation is flagged, returns undefined)
 */
  const createQuizObj = function(data) {
    const quiz = {
      questions: {},
    };
    const questions = quiz.questions;

    for (const input of data) {
      const name = input.name;
      const value = input.value;
      if (isNaN(name.charAt(0))) {
        if (!value) {
          return validationError(`#${name}`, `Please include a ${name.split('_')[1]} for your quiz.`);
        }
        if (value.length > 255) {
          return validationError(`#${name}`, `Quiz ${name.split('_')[1]} must be 255 characters or less.`);
        }
        quiz[name] = value;
        continue;
      }

      if (!value) {
        return validationError(`#${name}`, `Don't leave any blank questions or answers.`);
      }

      const quesId = name.split('-')[0];
      const ansId = name.split('-')[1];

      if (!questions[quesId]) {
        questions[quesId] = {
          answers: {}
        };
      }

      const question = questions[quesId];
      if (!ansId) {
        question.text = value;
        continue;
      }
      if (ansId === 'a') {
        question.correct = value.split('-')[1];
        continue;
      }
      question.answers[ansId] = value;
    }

    if (!quiz.quiz_private) {
      return validationError(`#quiz_private`,`Please choose whether your quiz will be public or private`);
    }

    if (Object.keys(questions).length < 1) {
      return validationError(null,`You must have at least one question`);
    }

    for (const quesId in questions) {
      if (!questions[quesId].correct) {
        return validationError(`#${quesId}`,`Please select a correct answer for each question`);
      }
    }

    $('.error_message').remove();
    return quiz;
  };

  /**
   * Render validation error on quiz form submission
   * @param {String} selector jQuery compatible selector that targets element to be given the invalid class.
   * @param {String} errMsg The element containing the quiz.
   * @return {boolean} true or false
   */
  const validationError = function(selector, errMsg) {
    $('.error_message').remove();

    const $error = $(`<div class="error_message"><p></p></div>`);
    $error.children('p').text(errMsg);
    $error.insertBefore('#form_foot');

    $(selector).addClass('invalid');
  };

  /**
   * Removes error formatting from $element
   * @param {jQueryElement} $element The element to remove error formatting from.
   * @return {none} none
   */
  const removeError = function($element) {
    $element.removeClass('invalid');
  };

  /**
  * Renders confirmation of quiz creation
  * @param {Object} data Information from server returned from quiz POSTing.
  * @param {Object} quiz Quiz object created by createQuizObj.
  * @return {none} none
  */
  const renderConfirmation = function(data, quiz) {
    let $confPage = $(`<article>
        <h3>Congratulations <span class="conf_user"></span>! Your new <span class="conf_private"></span> quiz "<span class="conf_title"></span>" was successfully created. 🥳</h3>
        <div class="copy_buttons">
          <button class="quizlink_button c_b"><span>Copy Quiz Link</span>&nbsp;<input class="copy_input" value=http://localhost:8080/quizapp/quiz/${data.url}></button>
          <button class="resultslink_button c_b"><span>Copy Results Link </span> &nbsp;<input class="copy_input" value=http://localhost:8080/quizapp/quiz/results/${data.resultsUrl}></button>
        </div>
      </article>`);

    const $header = $($confPage.children('h3'));
    $header.children(`.conf_user`).text($('#user_name').text());
    $header.children('.conf_title').text(quiz.quiz_title);
    $header.children('.conf_private').text(quiz.quiz_private === 'TRUE' ? 'private' : 'public');

    $('h1').html('Quiz Created');
    $('#quiz_form').remove();
    $('main').addClass('confirmation').append($confPage);

  };

})(jQuery);
