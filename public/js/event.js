/**
 * Created by Ken on 19/08/2015.
 */
app.controller('AddEventCtrl', function($scope, Event, $state){
    console.log("Add Event");

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;

    if(dd<10)    dd = '0' + dd;
    if(mm<10)    mm = '0' + mm;
    var strToday =  mm + '/' + dd + '/' + today.getFullYear();

    $scope.event={
        eventName:  "Test Event",
        startDate:  strToday + " 10:10 AM",
        endDate:    strToday + " 10:11 AM"
    };

    $scope.submit = function(option){
        $scope.event.startDate = new Date(document.getElementById('eventStartDate').value);
        $scope.event.endDate = new Date(document.getElementById('eventEndDate').value);

        Event.save($scope.event, function(data){
            if(option == 'all')
                $state.go('all');
            else{
                console.log(data);
                var _id = "";

                var array = $.map(data, function(value, index) {
                    return [value];
                });
                for (var j = 0; j <24; j++){
                    _id += array[j];
                }
                console.log(_id);

                $state.go('editEvent', {id: _id});
            }
        }, function(err){
            console.log('Error: ', err);
            $state.go('all');
        });
    };

});

//@todo: use $q to make promise before display warning
app.controller('EditEventCtrl',
    function($scope, Event, Student, $stateParams, $state, $q, lodash, $filter ){
    var _ = lodash;
    if(typeof($stateParams.id) === 'string'){
        $scope.event = Event.get({ id:$stateParams.id });
        $scope.students = Student.query();
        $scope.studentFields = ['firstName', 'lastName', 'email', 'cellPhone'];

    }
    else{   //No id, then go back to All state
        $state.go('all');
    }

    $scope.idSelected = [];
    $scope.setSelected = function (_id) {
        if($scope.idSelected.indexOf(_id) > -1){
            $scope.idSelected.splice($scope.idSelected.indexOf(_id), 1);
        }
        else {
            $scope.idSelected.push(_id);
        }
    };
    $scope.checkID = function(_id){
        return ($scope.idSelected.indexOf(_id) > -1);
    };

    $scope.submit = function(_o){
        //Part 1: prepare Event part
        console.log("Submit");
        $scope.event.startDate = new Date(document.getElementById('eventStartDate').value);
        $scope.event.endDate = new Date(document.getElementById('eventEndDate').value);
        console.log( $scope.event.startDate );
        console.log( $scope.event.endDate );
        //Part 2: prepare Student part
        var currStudent = [];
        if($scope.event.students != null){
            for(var i = 0; i< $scope.event.students.length; i++){
                var obj = {
                    _id: $scope.event.students[i]._id,
                    hours: $scope.event.students[i].hours
                }
                currStudent.push(obj);
            }
        }
        //Part 2.2: get selected ID
        for(i=0; i<$scope.idSelected.length; i++){
            var obj= {
                _id : $scope.idSelected[i],
                hours: 0
            }
            currStudent.push(obj);
        }
        console.log(currStudent);
        //Send to the Server;
        $scope.event.students = currStudent;
        console.log("Send this to the Server");
        console.log($scope.event);


        Event.put($scope.event, function (success) {
            if(_o == 'all'){
                $state.go('all');
            }

            var temptStudents = [];
            $scope.event.students = [];
            for(var i = 0; i < currStudent.length; i++){
                var tempt = _.findWhere($scope.students, { '_id' : currStudent[i]._id});
                if(tempt.hours==null)
                    tempt.hours = 0; // initialize hour
                tempt.hours = _.result(_.findWhere(currStudent, { '_id' : currStudent[i]._id}), 'hours');
                if(temptStudents.indexOf(tempt) < 0)
                    temptStudents.push(tempt);
            }

            $scope.event.students = temptStudents;
            $scope.idSelected = [];


        }, function (err) {
            console.log('Err', err);
        });

        $scope.event.startDate = document.getElementById('eventStartDate').value;
        $scope.event.endDate = document.getElementById('eventEndDate').value;
    };

    $scope.duplicateStudent = function(_id){
        if($scope.event.students != null){
            //return  _.includes($scope.event.students, _id.toString() );
            return  _.some($scope.event.students, {_id:_id} );
        }
        return false;
    };

    $scope.delete = function(_id){
        $('#deleteModal').on('hidden.bs.modal', function () {
            Event.delete({id:_id}, function(){
                    $state.go('all');
                },
                function(err){
                    console.log('Error: ', err);
                });
        });
    };

    $scope.$watch('event.startDate', function(){
        if($scope.event != null && $scope.event.startDate != null){
           // console.log("Change StartDate");
            $scope.event.startDate = $filter('dateTimeFilter2')($scope.event.startDate);
            document.getElementById('eventStartDate').value = $filter('dateTimeFilter2')($scope.event.startDate);
        }
    });
    $scope.$watch('event.endDate', function(){
        //console.log("Change EndDate");
        if($scope.event != null && $scope.event.endDate != null){
            $scope.event.endDate = $filter('dateTimeFilter2')($scope.event.endDate);
            document.getElementById('eventEndDate').value = $filter('dateTimeFilter2')($scope.event.endDate);
        }
    });
});