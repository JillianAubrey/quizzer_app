$(() => {
  $('.question_card li').on('click', function() {
    selectChildRadioButton($(this))});
});

const selectChildRadioButton = ($element) => {
  $element.parent().find('input:radio').attr('checked', false)
  $element.find('input:radio').attr('checked', true);
};
