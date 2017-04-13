var adminApp = angular.module('adminApp', ['ngMessages', 'ngTable']);

adminApp.controller('ManageCtrl', ['$scope', '$state', '$timeout', 'NgTableParams', 'adminBooksService', 'EventsService', 'LogsService', function($scope, $state, $timeout, NgTableParams, adminBooksService, EventsService, LogsService) {
  $scope.currentState = {
    route: 0,
    book: {
      count: {
        totalNum: 0,
        freeNum: 0,
        resNum: 0,
        borNum: 0
      },
      message: {
        type: 0,
        book: {}
      }
    },
    events: {
      count: 0,
      bCount: 0
    },
    logs: {
      count: 0
    },
  };

  $scope.alertMessage = function alertMessage(type, book) {
    $scope.currentState.book.message.type = type;
    $scope.currentState.book.message.book = book;
    $timeout(function() {
      $scope.currentState.book.message.type = 0;
      $scope.currentState.book.message.book = {};
    }, 3000);
  };

  function initData() {
    if ($state.current.name == 'manage.books') {
      $scope.currentState.route = 0;
    } else if ($state.current.name == 'manage.events') {
      $scope.currentState.route = 1;
    } else if ($state.current.name == 'manage.logs') {
      $scope.currentState.route = 2;
    }
  };

  initData();

  $scope.findBook = function findBook(bookId) {
    for (var index = 0; index < adminBooksService.books.length; index++) {
      if (adminBooksService.books[index].unqId == bookId) {
        return index;
      }
    }
  };
  $scope.$watch(function() {
    return adminBooksService.books.length;
  }, function() {
    $scope.currentState.book.count.totalNum = adminBooksService.books.length;
    $scope.currentState.book.count.freeNum = 0;
    $scope.currentState.book.count.resNum = 0;
    $scope.currentState.book.count.borNum = 0;
    angular.forEach(adminBooksService.books, function(book) {
      if (book.status == 0) {
        $scope.currentState.book.count.freeNum++;
      } else if (book.status == 1) {
        $scope.currentState.book.count.resNum++;
      } else if (book.status == 2) {
        $scope.currentState.book.count.borNum++;
      };
    })
  });

  $scope.$watch(function() {
    return EventsService.events.length;
  }, function() {
    $scope.currentState.events.count = EventsService.events.length;
  });

  $scope.$watch(function() {
    return LogsService.logs.length;
  }, function() {
    $scope.currentState.logs.count = LogsService.logs.length;
  });

  $scope.getBookData = function() {
    $scope.tableParams = new NgTableParams();
    adminBooksService.getAllBooks(function(res) {
      adminBooksService.books = [];
      adminBooksService.books = adminBooksService.books.concat(res);
      console.log('GetAllBooks', res);
      $scope.tableParams = new NgTableParams({
        count: 10
      }, {
        filterOptions: {
          filterComparator: false
        },
        counts: [5, 10, 25],
        dataset: adminBooksService.books
      });
    }, function(res) {
      console.log('getAllBooks Error', res);
    });
  };

  $scope.getEventData = function() {
    EventsService.getAllEvents().success(function(res) {
      EventsService.events = [];
      console.log('GetAllEvents', res);
      EventsService.events = res;
      $scope.eventTableParams = new NgTableParams({
        count: 10
      }, {
        counts: [5, 10, 25],
        dataset: EventsService.events
      });
    }).error(function(err) {
      console.error('GetAllEvents', err);
    });
  };

  $scope.getLogData = function() {
    LogsService.getAllLogs().success(function(res) {
      LogsService.logs = [];
      LogsService.logs = res;
      console.log('GetAllLogs:', LogsService.logs);
      $scope.logTableParams = new NgTableParams({
        count: 25
      }, {
        filterOptions: {
          filterComparator: false
        },
        counts: [25, 50, 100],
        dataset: LogsService.logs
      });
    }).error(function(res) {
      console.log('GetAllLogs Error:', res);
    });
  };
  $scope.getBookData();
  $scope.getEventData();
  $scope.getLogData();
}]);

adminApp.controller('ManageBooksCtrl', ['$scope', '$element', '$http', '$location', '$timeout', 'NgTableParams', 'adminBooksService', function($scope, $element, $http, $location, $timeout, NgTableParams, adminBooksService) {

  $scope.bookRoute = true;
  $scope.setting = {
    'search': {
      'type': '0',
      'value': ''
    },
    'showStatusValue': '',
    'showAllFilters': false,
    'showPublisher': false,
    'showPageCount': false,
    'showPrice': false,
    'showLikes': true,
    'showComments': false,
    'showEvaluations': false
  };
  $scope.getBookData();

  $scope.checkboxes = {
    checked: false,
    items: {}
  };
  $scope.statuses = [{
    id: 0,
    title: "Free"
  }, {
    id: 1,
    title: "Reserved"
  }, {
    id: 2,
    title: "Borrowed"
  }];


  $scope.$watch(function() {
    return $scope.checkboxes.checked;
  }, function(value) {
    angular.forEach(adminBooksService.books, function(item) {
      $scope.checkboxes.items[item.unqId] = value;
    });
  });

  function settingSearch() {
    if ($scope.setting.search.type == '0') {
      $scope.tableParams.filter().unqId = $scope.setting.search.value;
      $scope.tableParams.filter().name = '';
      $scope.tableParams.filter().author = '';
      $scope.tableParams.filter().isbn = '';
    } else if ($scope.setting.search.type == '1') {
      $scope.tableParams.filter().name = $scope.setting.search.value;
      $scope.tableParams.filter().unqId = '';
      $scope.tableParams.filter().author = '';
      $scope.tableParams.filter().isbn = '';
    } else if ($scope.setting.search.type == '2') {
      $scope.tableParams.filter().author = $scope.setting.search.value;
      $scope.tableParams.filter().unqId = '';
      $scope.tableParams.filter().name = '';
      $scope.tableParams.filter().isbn = '';
    } else if ($scope.setting.search.type == '3') {
      $scope.tableParams.filter().isbn = $scope.setting.search.value;
      $scope.tableParams.filter().unqId = '';
      $scope.tableParams.filter().name = '';
      $scope.tableParams.filter().author = '';
    }
  };

  $scope.$watch(function() {
    return $scope.setting.search.type;
  }, function(values) {
    settingSearch();
  });

  $scope.$watch(function() {
    return $scope.setting.search.value;
  }, function(values) {
    settingSearch();
  });

  $scope.$watch(function() {
    return $scope.checkboxes.items;
  }, function(values) {
    var checked = 0,
      unchecked = 0,
      total = adminBooksService.books.length;
    angular.forEach(adminBooksService.books, function(item) {
      checked += ($scope.checkboxes.items[item.unqId]) || 0;
      unchecked += (!$scope.checkboxes.items[item.unqId]) || 0;
    });
    if ((unchecked == 0) || (checked == 0)) {
      if (total != 0) {
        $scope.checkboxes.checked = (checked == total);
      }
    };
    angular.element($element[0].getElementsByClassName("select-all")).prop("indeterminate", (checked != 0 && unchecked != 0));
  }, true);

  var defaultSetting = {
    'search': {
      'type': '0',
      'value': ''
    },
    'showStatusValue': '',
    'showAllFilters': false,
    'showPublisher': false,
    'showPageCount': false,
    'showPrice': false,
    'showLikes': true,
    'showComments': false,
    'showEvaluations': false,
    'showStrict': false
  };

  var currentSetting = {
    'search': {
      'type': '',
      'value': ''
    },
    'showStatusValue': '',
    'showAllFilters': false,
    'showPublisher': false,
    'showPageCount': false,
    'showPrice': false,
    'showLikes': true,
    'showComments': false,
    'showEvaluations': false,
    'showStrict': false
  };

  $scope.setTable = function setTable() {
    currentSetting.search.type = $scope.setting.search.type;
    currentSetting.search.value = $scope.setting.search.value;
    currentSetting.showStatusValue = $scope.tableParams.filter().status;
    currentSetting.showAllFilters = $scope.setting.showAllFilters;
    currentSetting.showPublisher = $scope.setting.showPublisher;
    currentSetting.showPageCount = $scope.setting.showPageCount;
    currentSetting.showPrice = $scope.setting.showPrice;
    currentSetting.showLikes = $scope.setting.showLikes;
    currentSetting.showComments = $scope.setting.showComments;
    currentSetting.showEvaluations = $scope.setting.showEvaluations;
    currentSetting.showStrict = $scope.tableParams.settings().filterOptions.filterComparator;
  };

  $scope.restoreTable = function restoreTable() {
    $scope.setting.search.type = defaultSetting.search.type;
    $scope.setting.search.value = defaultSetting.search.value;
    $scope.tableParams.filter().status = defaultSetting.showStatusValue;
    $scope.setting.showAllFilters = defaultSetting.showAllFilters;
    $scope.setting.showPublisher = defaultSetting.showPublisher;
    $scope.setting.showPageCount = defaultSetting.showPageCount;
    $scope.setting.showPrice = defaultSetting.showPrice;
    $scope.setting.showLikes = defaultSetting.showLikes;
    $scope.setting.showComments = defaultSetting.showComments;
    $scope.setting.showEvaluations = defaultSetting.showEvaluations;
    $scope.tableParams.settings().filterOptions.filterComparator = defaultSetting.showStrict;
  };

  $scope.cancelTable = function cancelTable() {
    $scope.setting.search.type = currentSetting.search.type;
    $scope.setting.search.value = currentSetting.search.value;
    $scope.tableParams.filter().status = currentSetting.showStatusValue;
    $scope.setting.showAllFilters = currentSetting.showAllFilters;
    $scope.setting.showPublisher = currentSetting.showPublisher;
    $scope.setting.showPageCount = currentSetting.showPageCount;
    $scope.setting.showPrice = currentSetting.showPrice;
    $scope.setting.showLikes = currentSetting.showLikes;
    $scope.setting.showComments = currentSetting.showComments;
    $scope.setting.showEvaluations = currentSetting.showEvaluations;
    $scope.tableParams.settings().filterOptions.filterComparator = currentSetting.showStrict;
  };

  $scope.deleteBooks = function deleteBooks() {
    $scope.deleteBookList = {
      isDeleting: false,
      deletedNum: 0,
      list: []
    };
    angular.forEach(adminBooksService.books, function(book) {
      if ($scope.checkboxes.items[book.unqId]) {
        var newbook = {
          unqId: book.unqId,
          name: book.name,
          isbn: book.isbn,
          delType: 0
        };
        $scope.deleteBookList.list.push(book);
      }
    });
    if ($scope.deleteBookList.list.length !== 0) {
      $('#deleteBooksModal').modal('toggle');
    };
  };

  $scope.startDelete = function startDelete() {
    var count = 0;
    var succCount = 0;
    var failCount = 0;

    function result(count) {
      if (count == $scope.deleteBookList.list.length) {
        $('#deleteBooksModal').modal('hide');
        if (failCount == 0) {
          $scope.alertMessage(3, {
            'count': count
          });
        } else {
          $scope.alertMessage(9, {
            'succCount': succCount,
            'failCount': failCount
          });
        };
      };
    }

    angular.forEach($scope.deleteBookList.list, function(book) {
      adminBooksService.deleteOneBook(book.unqId, function(res) {
        if (res.errType == 0) {
          adminBooksService.books.splice($scope.findBook(book.unqId), 1);
          $scope.tableParams.reload();
          succCount++;
          result(++count);
        } else {
          failCount++;
          result(++count);
        };

      }, function(res) {
        failCount++;
        result(++count);
      });
    });
  };

  $scope.modifyBook = function modifyBook() {
    var modifyBookList = [];
    angular.forEach(adminBooksService.books, function(book) {
      if ($scope.checkboxes.items[book.unqId]) {
        modifyBookList.push(book.unqId);
      }
    });
    if (modifyBookList.length == 1) {
      $location.path('/manage/book/' + modifyBookList[0]);
    };
  }
}]);

adminApp.controller('ManageBookCtrl', ['$scope', '$http', '$timeout', '$location', '$stateParams', 'adminBooksService', function($scope, $http, $timeout, $location, $stateParams, adminBooksService) {
  $scope.book = {};
  $scope.initBook = function initBook() {
    for (var index = 0; index < adminBooksService.books.length; index++) {
      if (adminBooksService.books[index].unqId == $stateParams.bookId) {
        $scope.book = adminBooksService.books[index];
        console.log($scope.book);
        break;
      }
    };
    if (!$scope.book.unqId) {
      $location.path('/manage/books');
    };
  };
  $scope.initBook();
  $scope.getDouban = function getDouban() {
    var iserror = true;
    $http.jsonp('http://api.douban.com/v2/book/isbn/' + $scope.book.isbn, {
      params: {
        'callback': 'MyCallback'
      }
    }).error(function(data) {
      if (iserror) {
        $scope.alertMessage(15, $scope.book);
      };
    });
    window.MyCallback = function(data) {
      iserror = false;
      console.log("Complete book info:", data);
      $scope.book.name = data.title;
      $scope.book.image = data.images.large;
      $scope.book.author = data.author[0];
      $scope.book.publisher = data.publisher;
      $scope.book.pageCount = data.pages;
      $scope.book.price = data.price.replace(/[\u4e00-\u9fa5]/, '');
      $scope.book.desc = data.summary;
    };
  };
  $scope.saveBook = function saveBook() {
    $("#saveButton").button('loading');
    adminBooksService.setBook($scope.book, function(res) {
      if (res.errType == 0) {
        adminBooksService.books.splice($scope.findBook($scope.book.unqId), 1, $scope.book);
        $scope.alertMessage(4, $scope.book);
        $location.path('/manage/books');
      } else if (res.errType == 1) {
        $scope.alertMessage(11, $scope.book);
      } else {
        $scope.alertMessage(12, $scope.book);
      };
      $("#saveButton").button('reset');
    }, function(res) {
      $("#saveButton").button('reset');
      $scope.alertMessage(12, $scope.book);
    })
  };
  $scope.deleteBook = function deleteBook() {
    $("#deleteButton").button('loading');
    adminBooksService.deleteOneBook($scope.book.unqId, function(res) {
      if (res.errType == 0) {
        adminBooksService.books.splice($scope.findBook($scope.book.unqId), 1);
        $scope.alertMessage(2, $scope.book);
        $timeout(function() {
          $location.path('/manage/books');
        }, 500);
      } else if (res.errType == 1) {
        $scope.alertMessage(7, $scope.book);
      } else {
        $scope.alertMessage(8, $scope.book);
      };
      $("#deleteButton").button('reset');
    }, function(res) {
      $("#deleteButton").button('reset');
      $scope.alertMessage(8, $scope.book);
    });
    $('#deleteBookModal').modal('hide');
  };
}]);

adminApp.controller('NewBookCtrl', ['$scope', '$http', '$timeout', '$location', 'adminBooksService', function($scope, $http, $timeout, $location, adminBooksService) {
  $scope.book = {};
  $scope.book.status = 0;

  $scope.getDouban = function getDouban() {
    var iserror = true;
    $http.jsonp('http://api.douban.com/v2/book/isbn/' + $scope.book.isbn, {
      params: {
        'callback': 'MyCallback'
      }
    }).error(function(data) {
      if (iserror) {
        $scope.alertMessage(15, $scope.book);
      };
    });
    window.MyCallback = function(data) {
      iserror = false;
      console.log("Complete book info:", data);
      $scope.book.name = data.title;
      $scope.book.image = data.images.large;
      $scope.book.author = data.author[0];
      $scope.book.publisher = data.publisher;
      $scope.book.pageCount = data.pages;
      $scope.book.price = data.price.replace(/[\u4e00-\u9fa5]/, '');
      $scope.book.desc = data.summary;
    };
  };
  $scope.addBook = function addBook() {
    $('#addButton').button('loading');
    adminBooksService.addBook($scope.book, function(res) {
      if (res.errType == 0) {
        adminBooksService.books.push($scope.book);
        $location.path('/manage/books');
        $scope.alertMessage(1, $scope.book);
      } else if (res.errType == 1) {
        $scope.alertMessage(5, $scope.book);
      } else {
        $scope.alertMessage(6, $scope.book);
      };
      $('#addButton').button('reset');
    }, function(res) {
      $('#addButton').button('reset');
      $scope.alertMessage(6, $scope.book);
    });
  };
}]);

adminApp.controller('ManageEventsCtrl', ['$scope', '$rootScope', 'EventsService', 'NgTableParams', 'adminBooksService', function($scope, $rootScope, EventsService, NgTableParams, adminBooksService) {

  $scope.getEventData();
  $scope.accept = function(event) {
    $scope.curEvent = event;
    EventsService.acceptEvent(event.unqId, event.intrID).success(function(res) {
      if (res.errType == 0) {
        for (var i = 0; i < EventsService.events.length; i++) {
          if (EventsService.events[i].unqId === event.unqId) {
            EventsService.events[i].status = 2;
            EventsService.events[i].borrowTime = res.borrowTime;
            EventsService.events[i].returnTime = res.returnTime;
            break;
          };
        }
      } else {
        $('#warningModal').modal('show');
      };
    }).error(function(res) {
      console.log(res);
      $('#warningModal').modal('show');
    });
  };

  $scope.return = function(event) {
    EventsService.returnEvent(event.unqId, event.intrID).success(function(res) {
      if (res.errType == 0) {
        for (var i = 0; i < EventsService.events.length; i++) {
          if (EventsService.events[i].unqId === event.unqId) {
            EventsService.events.splice(i, 1);
            $scope.eventTableParams.reload();
            break;
          };
        }
      } else {
        $('#returnModal').modal('show');
      };
    }).error(function(res) {
      console.log(res);
      $('#returnModal').modal('show');
    });
  };
}]);

adminApp.controller('ManageLogsCtrl', ['$scope', 'LogsService', function($scope, LogsService) {
  $scope.getLogData();
  $scope.deleteLog = function(_id) {
    LogsService.deleteLog(_id).success(function(res) {
      for (var i = 0; i < LogsService.logs.length; i++) {
        if (LogsService.logs[i]._id == _id) {
          LogsService.logs.splice(i, 1);
          $scope.logTableParams.reload();
          break;
        };
      }
    });
  }
}])
