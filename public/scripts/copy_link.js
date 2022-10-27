(($) => {

$(() => {
  $(document).on('click', `.c_b`, copyMessage);
});

const copyMessage = function() {
    $(this).find('input').select();
    document.execCommand('copy');

    let $text = $(this).find('span').text();

    $(this).find('span').text('Link Copied!');
    setTimeout(() => {
      $(this).find('span').text($text);
    }, 2000);
  };

})(jQuery)
