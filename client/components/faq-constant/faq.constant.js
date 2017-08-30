'use strict';
(function () {
  /**
   * @ngdoc service
   * @name app.faq
   * @description
   * # faq
   * Constant in the app.
   */
  angular.module('app')
    .constant('faq', [
      {
        question: 'Where is Armoire available?',
        answer: 'Currently, only in Chicago, IL, USA. We hand deliver the armoire and take them to our storage facility. San Francisco and New York City are next inline.'
      },
      {
        question: 'What conditions are the armoire stored in?',
        answer: 'Our storage facility is temperature and humidity controlled and has video surveillance 24 hours a day, 365 days a year.'
      }
    ]);
})();
