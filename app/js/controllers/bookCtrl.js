var bookApp = angular.module('bookApp', ['wu.masonry', 'infinite-scroll', 'serviceApp']);
bookApp.controller('MainBooksCtrl', ['$scope', '$state', '$rootScope', 'BooksService', function($scope, $state, $rootScope, BooksService) {
  console.log('MainBooksCtrl Start');
  $scope.books = [];
  $scope.popBooks = [];
  $scope.getDataOver = false;
  $scope.showScrollToTop = false;
  var eachPageBooksCount = 10;

  $scope.$watch(function() {
    return $state.current.name;
  }, function() {
    if ($state.current.name == "main.all") {
      $scope.cate = '';
    } else if ($state.current.name == "main.frontend") {
      $scope.cate = 'Frontend';
    } else if ($state.current.name == "main.backend") {
      $scope.cate = 'Backend';
    } else if ($state.current.name == "main.database") {
      $scope.cate = 'Database';
    } else if ($state.current.name == "main.bigdata") {
      $scope.cate = 'Big Data';
    } else if ($state.current.name == "main.ios") {
      $scope.cate = 'IOS/Android';
    } else if ($state.current.name == "main.ui") {
      $scope.cate = 'UI Design';
    } else if ($state.current.name == "main.other") {
      $scope.cate = 'Other';
    } else if ($state.current.name == "main.liked") {
      $scope.cate = 'userLiked';
    } else if ($state.current.name == "main.borrowed") {
      $scope.cate = 'userBorrowed';
    };
  });

  $scope.updatePop = function() {
    function sortLikes(a, b) {
      return b.likes.length - a.likes.length;
    };
    var books = [];
    $scope.popBooks = [];
    for (var index in $scope.books) {
      books.push($scope.books[index]);
    };
    $scope.popBooks = books.sort(sortLikes);
  };


  $scope.showMoreBooks = function() {
    // var start = $scope.books.length;
    // var end = Math.min(start + 10, BooksService.books.length);
    // for (var i = start; i < end; i++) {
    //   $scope.books.push(BooksService.books[i]);
    // };
    // if (start >= eachPageBooksCount * 2) {
    //   $scope.showScrollToTop = true;
    // };
  };

  $scope.update = function() {
    $scope.books = [];
    $scope.getDataOver = false;
    $scope.showScrollToTop = false;

    BooksService.getAllBooks()
      .success(function(res) {
        var intrID = $rootScope.logInUser.intrID;
        var total = 0;
        for (var i = 0; i < res.length; i++) {
          for (var k = 0; k < res[i].likes.length; k++) {
            if (res[i].likes[k] === intrID) {
              res[i].isLiked = true;
              break;
            };
          };
          total = 0;
          for (var k = 0; k < res[i].rates.length; k++) {
            total += res[i].rates[k].value;
            if (res[i].rates[k].intrID === intrID) {
              res[i].isRated = true;
              res[i].rateValue = res[i].rates[k].value;
            };
          };
          res[i].avaValue = res[i].rates.length == 0 ? 0 : parseFloat(total / res[i].rates.length).toFixed(1);
          res[i].image = res[i].image ? res[i].image : "images/gray.jpg";
          $scope.books.push(res[i]);
        };
        $scope.updatePop();
        $scope.getDataOver = true;
      });
  };
}]);

bookApp.controller('AllBooksCtrl', ['$scope', '$rootScope', '$state', '$timeout', 'BooksService',function($scope, $rootScope, $state, $timeout, BooksService) {
  console.log('AllBooksCtrl Start');
  $scope.update();
  var timeout;
  $scope.like = function(book) {
    book.isLiked = !book.isLiked;
    if (timeout) $timeout.cancel(timeout);
    timeout = $timeout(function() {
      BooksService.likeBook(book.isbn, $rootScope.logInUser.intrID, book.isLiked).success(function(res) {
        book.likes = res;
        for (var i = 0; i < book.likes.length; i++) {
          if (book.likes[i] === $rootScope.logInUser.intrID) {
            book.isLiked = true;
            break;
          };
        };
        $scope.updatePop();
      });
    }, 500);
  };
}]);

bookApp.controller('DetailBookCtrl', ['$scope', '$rootScope', '$timeout', '$state', '$location', 'BooksService', '$window', function($scope, $rootScope, $timeout, $state, $location, BooksService, $window) {
  console.log('DetailBookCtrl Start');
  $scope.simBooks = [];
  $scope.tarValue = 0;
  $scope.content = '';
  $scope.index = -1;
  $scope.update();
  $scope.expireDate = new Date();

  $scope.$watch(function() {
    return $scope.getDataOver;
  }, function() {
    for (var i = 0; i < $scope.books.length; i++) {
      if ($scope.books[i].isbn == $state.params.bookId) {
        $scope.index = i;
        if ($scope.books[i].applyTime) {
          $scope.expireDate = new Date($scope.books[i].applyTime).setDate(new Date($scope.books[i].applyTime).getDate() + 2);
        };
        break;
      };
    };
  });

  BooksService.getSimilarBooks($state.params.bookId).success(function(res) {
    $scope.simBooks = res;
    $scope.showSimilarBooks = $scope.simBooks.length != 0 ? true : false;
  });

  $scope.borrow = function() {
    BooksService.borrrowBook($state.params.bookId, $rootScope.logInUser.intrID).success(function(res) {
      if (res.errType == 0) {
        $scope.books[$scope.index].intrID = $rootScope.logInUser.intrID;
        $scope.books[$scope.index].status = 1;
        $scope.books[$scope.index].applyTime = res.applyTime;
        $scope.showMsg = true;
        if ($scope.books[$scope.index].applyTime) {
          $scope.expireDate = new Date($scope.books[$scope.index].applyTime).setDate(new Date($scope.books[$scope.index].applyTime).getDate() + 2);
        };
      } else if (res.errType == 1) {
        $('#warningModal').modal('show');
      } else if (res.errType == 2) {
        $('#noneModal').modal('show');
      } else if (res.errType == 3) {
        $('#errorModal').modal('show');
      };
    }).error(function(res) {
      console.log(res, "BorrowBook");
    });
  };

  $scope.cancel = function() {
    $timeout(function() {
      BooksService.cancelBook($state.params.bookId, $rootScope.logInUser.intrID).success(function(res) {
        delete $scope.books[$scope.index].intrID;
        $scope.books[$scope.index].status = 0;
      }).error(function(res) {
        console.log("cancelBook error");
      });
    }, 200);
  };

  var timeout;
  $scope.like = function() {
    $scope.books[$scope.index].isLiked = !$scope.books[$scope.index].isLiked;
    if (timeout) $timeout.cancel(timeout);
    timeout = $timeout(function() {
      BooksService.likeBook($scope.books[$scope.index].isbn, $rootScope.logInUser.intrID, $scope.books[$scope.index].isLiked).success(function(res) {
        $scope.books[$scope.index].likes = res;
        $scope.updatePop();
      });
    }, 500);
  };

  $scope.rate = function(value) {
    $scope.books[$scope.index].rateValue = value;
    BooksService.rateBook($scope.books[$scope.index].isbn, $rootScope.logInUser.intrID, value).success(function(res) {
      $scope.books[$scope.index].rates = res;
      var total = 0;
      for (var i = 0; i < $scope.books[$scope.index].rates.length; i++) {
        total += $scope.books[$scope.index].rates[i].value;
        if ($scope.books[$scope.index].rates[i].intrID === $rootScope.logInUser.intrID) {
          $scope.books[$scope.index].isRated = true;
          $scope.books[$scope.index].rateValue = $scope.books[$scope.index].rates[i].value;
        };
      };
      $scope.books[$scope.index].avaValue = $scope.books[$scope.index].rates.length == 0 ? 0 : parseFloat(total / $scope.books[$scope.index].rates.length).toFixed(1);
    });
  };

  $scope.comment = function() {
    if ($scope.content.length != 0) {
      BooksService.commentBook($scope.books[$scope.index].isbn, $rootScope.logInUser.intrID, $scope.content).success(function(res) {
        $scope.books[$scope.index].comments = res;
        $scope.content = '';
      });
    };
  };

  $scope.deleteComment = function(id) {
    BooksService.deleteComment($scope.books[$scope.index].isbn, id).success(function(res) {
      $scope.books[$scope.index].comments = res;
    }).error(function(res) {
      console.error("deleteComment error", res);
    });
  }
}]);
