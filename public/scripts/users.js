// Client facing scripts here
(($) => {

  $(() => {
    //Page loads on user quizzes by default
    showMyQuizzes();
    //Clicking quizzes button will load user quizzes
    $('.quizzes_btn').on('click', showMyQuizzes);
    //Clicking results button will load user attempts
    $(`.results_btn`).on('click', showMyAttempts);
    //Clicking on 'make private'/'make public' button will
    $(`.public`).on('click', function(event) {
      event.preventDefault();
      changePrivacy($(this));
    });
    //Clicking on a quiz's delete button will initiate delete confirmation
    $(`.delete`).on('click', function(event) {
      event.preventDefault();
      confirmDelete($(this));
    });
    //Clicking on the delete confirmation will delete the quiz
    $(document).on('click', `.confirm_delete`,  function(event) {
      event.preventDefault();
      deleteQuiz($(this));
    });

  });

  /**
   * Show quizzes on user page and hide attempts
   * @return {none} none
   */
  const showMyQuizzes = function() {
    $(`.my_quiz`).show();
    $(`.my_quiz_attempts`).hide();
    $(`h1`).html('My Quizzes');
    $(`.quizzes_btn`).addClass("selected");
    $(`.results_btn`).removeClass("selected");
  };

  /**
   * Show attempts on user page and hide quizzes
   * @return {none} none
   */
  const showMyAttempts = function() {
    $(`.my_quiz`).hide();
    $(`.my_quiz_attempts`).show();
    $(`h1`).html('My Quiz Attempts');
    $(this).addClass("selected");
    $(`.quizzes_btn`).removeClass("selected");
  };

  /**
   * Change privacy of quiz associated with $privacyButton
   * @param {jQueryElement} $privacyButton Button to change privacy on quiz card
   * @return {none} none
   */
  const changePrivacy = function($privacyButton) {
    const $visibility = $privacyButton.find('span');
    let visibility = $visibility.text();
    let qurl = $privacyButton.attr('id');
    $.ajax({
      url: `/api/quiz/visibility/${qurl}`,
      method: 'POST',
      data: {
        visibility
      }
    }).done(() => {
      visibility === 'Public' ? $visibility.text('Private') : $visibility.text('Public');
    }).fail((error) => console.log(error));
  };

  /**
   * Changes delete button into deltion confirmation button
   * @param {jQueryElement} $deleteButton Delete button that initiated deletion
   * @return {none} none
   */
  const confirmDelete = function($deleteButton) {
    const text = $deleteButton.text();
    $deleteButton.text('Are you sure? Click again to confirm');

    setTimeout(() => {
      $deleteButton.addClass('confirm_delete');
    }, 100);

    setTimeout(() => {
      $deleteButton.text(text);
      $deleteButton.removeClass('confirm_delete');
    }, 3000);
  };

  /**
   * Delete quiz associated with $deleteButton
   * @param {jQueryElement} $deleteButton Delete button that initiated deletion
   * @return {none} none
   */
  const deleteQuiz = function($deleteButton) {
    qurl = $deleteButton.closest('form').attr('action');
    $.post(qurl)
      .done(() => {
        $deleteButton.html('Quiz Deleted Successfully');
        setTimeout(() => {
          let $quiz = $deleteButton.closest('.quiz_card');
          $quiz.slideUp(200, () => $quiz.remove());
        }, 1200);

      })
      .fail(error => console.log(error));
  };

})(jQuery);
