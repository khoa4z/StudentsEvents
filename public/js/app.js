var app = angular.module('TemplateApp', ['ui.router', 'ngResource', 'ngMessages', 'ngLodash', 'ngRoute']);
app.config([ '$stateProvider', '$urlRouterProvider','$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider){
    $locationProvider.html5Mode({       //ngRoute is required for this
        enabled : true,
        requireBase : false
    });
    $urlRouterProvider.otherwise('/');  //default
    $stateProvider
        .state('home',{
            url:'/',
            templateUrl: '/views/home.html',
            controller:'HomeCtrl'
        })
        .state('homeUrl',{
            url:'/home',
            controller: function($state){
                $state.go('home');
            }
        })
        .state('all', {
            url:'/all',
            templateUrl: '/views/all.html',
            controller: 'AllCtrl'
        })
        .state('addStudent', {
            url:'/addStudent',
            templateUrl: '/views/addStudent.html',
            controller: 'AddStudentCtrl'
        })
        .state('editStudent', {
            params: {id: {}},
            url:'/editStudent',
            templateUrl: '/views/editStudent.html',
            controller: 'EditStudentCtrl'
        })
        .state('addEvent', {
            url:'/addEvent',
            templateUrl: '/views/addEvent.html',
            controller: 'AddEventCtrl'
        })
        .state('editEvent', {
            params: {id: {}},
            url:'/editEvent',
            templateUrl: '/views/editEvent.html',
            controller: 'EditEventCtrl'
        });
}]);

app.controller('HomeCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state){
    $rootScope.PAGE = 'home';
    $scope.example = "Example One";

    $scope.allStudent = function (){
        $state.go('all');
    };

}]);

//app.controller('AllCtrl' , ['$scope','$rootScope', '$state' , '$http', 'Student', function($scope, $rootScope, $state,  $http, Student){
app.controller('AllCtrl', function($scope, $rootScope, $state,  $http, Student, Event){
    $rootScope.PAGE = 'all';
    //$state.go('editEvent', {id: '55d4b5ce7a1f8699ec2d16d8'});

    $scope.studentFields = ['firstName', 'lastName', 'email', 'cellPhone'];
    //http only works with PC or somehow, only factory can be called by phone.
    //$http.get('http://localhost:3007/api/student').
    //    success(function(data) {
    //        $scope.students = data;
    //    });
    //@todo: make a promise before displaying warning in front end
    $scope.students = Student.query();

    $scope.editStudent = function(_id){
        $state.go('editStudent', {id: _id});
    };
    $scope.sort = function(field){
        $scope.currentField = field;
        $scope.currentOrder = !$scope.currentOrder;
    };
    $scope.currentField = $scope.studentFields[0];
    $scope.currentOrder = false;

    $scope.delete = function(stud){
        Student.delete({id:stud._id}, function(){ },
            function(err){
                console.log('Error: ', err);
        });
        var index = $scope.students.indexOf(stud);
        if(index > -1){
            $scope.students.splice(index, 1);
        }
    };

    $scope.eventFields = ['eventName', 'fundedBy', 'startDate', 'endDate'];
    $scope.events = Event.query();

    $scope.editEvent = function(_id){
        $state.go('editEvent', {id: _id});
    };

    $scope.deleteEvent = function(event){
        Event.delete({id:event._id}, function(){},
            function(err){
                console.log('Error: ', err);
            });
        var index = $scope.events.indexOf(event);
        if( index > -1){
            $scope.events.splice(index, 1);
        }
    }
});