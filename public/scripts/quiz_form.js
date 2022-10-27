(($) => {

  $(() => {

    //adds three questions to the form on load
    for (let i = 0; i < 3; i++) {
      addQuestion();
    }

    //validates the input and submits the form if the checks pass
    $('#quiz_form').on('submit', submitQuiz);

    //adds an answer input to a question form
    $(document).on('click', '.add_answer', function(event) {
      event.preventDefault()
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
 * POST selected answers as a quiz attempt, then redirect to attempt page.
 * @param {jQueryEvent} event The element containing the quiz.
 * @return {none}
 */
  const submitQuiz = function(event) {
    event.preventDefault();
    const data = $(this).serialize()
    const valData = $(this).serializeArray().reduce((valData, input) => {
      valData[input.name] = input;
      return valData;
    }, {});

    if (validateData(valData)) {
      $.post('/api/quiz', data).then((res) => {
        renderConfirmation(res);
      });
    }
  };

  /**
 * Add an answer field to a question form
 * @param {jQueryEvent} event The event that triggered adding a question, default will be prevented.
 * @param {jQueryElement} $questionForm The question form element
 * @return {none}
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
   * Deletes the last element in $element that matches selector
   * @param {jQueryElement} $element The target element, containd the element to be deleted.
   * @param {String} selector jQuery compatible selector that targets element to be deleted.
   * @return {none}
   */
  const deleteLast = ($element, selector) => {
    const $last = $element.find(selector).last() || null;
    if ($last) {
      deleteElementAnimate($last);
    }
  }

    /**
   * Add an answer field to a question form
   * @param {jQueryEvent} event The element containing the quiz.
   * @return {none}
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

    for (i = 0; i < 4; i++) {
      addAnswer($newQuestion);
    }

    $newQuestion.insertBefore('#form_questions');

    $(`#${questionNum}`).closest(`.question_form`).hide().show(400);

  };

  /**
   * Deletes $element with an animation
   * @param {jQueryElement} $element Element to delete.
   * @return {none}
   */
  const deleteElementAnimate = function($element) {
    $element.hide(400, () => $element.remove());
  }

  /**
   * Format $answer as the correct answer for its question, and remove correct answering formatting from other answers on the question.
   * @param {jQueryElement} $answer The element that is the correct answer.
   * @return {none}
   */
  const formatCorrect = function($answer) {
    const $answerContainer = $answer.closest('.answer_container')

    $answerContainer.find('.correct').removeClass('correct');
    $answer.children('input[type="text"]').addClass('correct');

    $answerContainer.find('span').remove();
    $answer.append(`<span> ✅ </span>`);
  };

   /**
 * Validate the form data before submission
 * @param {inputsArray} array The element containing the quiz.
 * @return {boolean} true or false
 */
  const validateData = function(valData) {
    let countQ = 0; //Question count
    let countA = 0; //Correct answer count

    const { quiz_title, quiz_description, quiz_private, ...qsAndAs } = valData;

    if (quiz_title.value.length > 255) {
      validationError(`#quiz_title`,`Title must be 255 characters or less`);
      return;
    }
    if (quiz_title.value.length === 0) {
      validationError(`#quiz_title`,`Please include a title for your quiz`);
      return;
    }
    if (quiz_description.value.length > 255) {
      validationError(`#quiz_description`,`Description must be 255 characters or less`);
      return;
    }
    if (quiz_description.value.length === 0) {
      validationError(`#quiz_description`,`Please include a description for your quiz`);
      return;
    }

    if (!quiz_private) {
      validationError(`#quiz_private`,`Please choose whether your question will be public or private`);
      return;
    }

    if (Object.keys(qsAndAs) <= 1) {
      validationError(null,`You must have at least one question`);
      return;
    }

    for (const id in qsAndAs) {
      if (id.length === 1) {
        countQ++
      }
      if (id.slice(-1) === 'a') {
        countA++;
      }
      if (qsAndAs[id].value.length === 0) {
        validationError(`#${id}`,`Don't leave any blank questions or answers.`);
        return;
      }
    }

    if (countQ !== countA) {
      validationError(null,`Please select a correct answer for each question`)
      return;
    }

    $('.error_message').remove();
    return true;
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
  }

  /**
   * Removes error formatting from $element
   * @param {jQueryElement} $element The element to remove error formatting from.
   * @return {none}
   */
  const removeError = function($element) {
    $element.removeClass('invalid');
  };

  /**
  * Renders confirmation of quiz creation
  * @param {object} data Information from server returned from quiz POSTing.
  * @return {none}
  */
  const renderConfirmation = function(data) {
    let visibility;
    if (data.quizPrivate === 'FALSE') {
      visibility = 'public';
    } else {
      visibility = 'private';
    }

    let $confPage = $(`<article>
        <h3>Congratulations <span class="conf_user"></span>! Your new <span class="conf_private"></span> quiz "<span class="conf_title"></span>" was successfully created. 🥳</h3>
        <div class="copy_buttons">
          <button class="quizlink_button c_b"><span>Copy Quiz Link</span>&nbsp;<input class="copy_input" value=http://localhost:8080/quizapp/quiz/${data.url}></button>
          <button class="resultslink_button c_b"><span>Copy Results Link </span> &nbsp;<input class="copy_input" value=http://localhost:8080/quizapp/quiz/results/${data.resultsUrl}></button>
        </div>
      </article>`);

    const $header = $($confPage.children('h3'))
    $header.children(`.conf_user`).text(data.userName)
    $header.children('.conf_title').text(data.quizTitle)
    $header.children('.conf_private').text(visibility);

    $('h1').html('Quiz Created');
    $('#quiz_form').remove();
    $('main').addClass('confirmation').append($confPage);

  };

})(jQuery);
