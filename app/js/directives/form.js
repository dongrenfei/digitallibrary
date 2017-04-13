var directApp = angular.module('directApp', []);
var validateEmail = /^\w{1,22}(@cn.ibm.com)$/;
var validatePwd = /(?=^\S{6,}$)(?!(^[a-zA-Z\`\~\!\@\#\$\%\^\&\*\;\:\'\"\,\<\.\>\-\_\=\+\(\)\[\]\{\}\?\/\\\|]*$))(?!(^[0-9\`\~\!\@\#\$\%\^\&\*\;\:\'\"\,\<\.\>\-\_\=\+\(\)\[\]\{\}\?\/\\\|]*$))/ ;
var validatePhone = /^[0-9]{11}$/;

directApp.directive('customEmailFormat', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
        var viewValue = scope.user.intrID;
        if (viewValue != undefined) {
          if (validateEmail.test(viewValue)) {
            ctrl.$setValidity('format', true);
          } else {
            ctrl.$setValidity('format', false);
          };
        } else {
          ctrl.$setValidity('format', true);
        };
      });
    }
  }
});

directApp.directive('customPwdFormat', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
        var viewValue = scope.user.pwd;
        if (validatePwd.test(viewValue)) {
          ctrl.$setValidity('format', true);
        } else {
          ctrl.$setValidity('format', false);
        };
      });
    }
  }
});

directApp.directive('customPhoneNumFormat', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ctrl) {
      scope.$watch(attrs.ngModel, function() {
        var viewValue = scope.user.phoneNum;
        if (viewValue != undefined) {
          if (validatePhone.test(viewValue)) {
            ctrl.$setValidity('format', true);
          } else {
            ctrl.$setValidity('format', false);
          };
        } else {
          ctrl.$setValidity('format', true);
        };
      });
    }
  }
});
