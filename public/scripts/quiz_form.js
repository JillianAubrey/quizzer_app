$(() => {
  $('#quiz_form').on('submit', submitQuiz)
})



const submitQuiz = function(event) {
 event.preventDefault();
  const data = $(this).serialize();

  $post('/api', data);

}
