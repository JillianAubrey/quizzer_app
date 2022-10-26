// Client facing scripts here
(($) => {

  $(() => {

    showMyQuizzes();

    $('.quizzes_btn').on('click', showMyQuizzes);

    $(`.results_btn`).on('click', showMyAttempts);

    $(`.c_b`).on('click', copyMessage)

    $(`.public`).on('click', changePrivacy)

    $(`.delete`).on('click', confirmDelete)

    $(document).on('click', `.confirm_delete`,  deleteQuiz)

  })

  const showMyQuizzes = function() {
    $(`.my_quiz`).show();
    $(`.my_quiz_attempts`).hide();
    $(`h1`).html('My Quizzes');
    $(`.quizzes_btn`).addClass("selected");
    $(`.results_btn`).removeClass("selected");
  }

  const showMyAttempts = function() {
    $(`.my_quiz`).hide();
    $(`.my_quiz_attempts`).show();
    $(`h1`).html('My Quiz Attempts');
    $(this).addClass("selected");
    $(`.quizzes_btn`).removeClass("selected");
  }

  const copyMessage = function() {
    $(this).find('input').select();
    document.execCommand('copy');

    let $text = $(this).find('span').text()

    $(this).find('span').text('Link Copied!')
    setTimeout(() => {
      $(this).find('span').text($text)
    }, 2000)
  }

  const changePrivacy = function(event) {
    event.preventDefault();
    let visibility = $(this).find('span').html();
    let qurl = $(this).attr('id');
    $.ajax({
      url: `/api/visibility/${qurl}`,
      method: 'POST',
      data: {
        visibility
      }
    }).done(() => {
      visibility = 'Public' ? $(this).find('span').html('Private') : $(this).find('span').html('Private');
    }).fail((error) => console.log(error));
  }

})(jQuery);
