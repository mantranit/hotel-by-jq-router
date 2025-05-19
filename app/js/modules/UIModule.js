$(function() {
  var UIModule = {
    renderTemplate: function(templateId, data) {
      var template = $(templateId).html();
      var compiledTemplate = Handlebars.compile(template);
    },
  };
  window.UIModule = UIModule;
});
