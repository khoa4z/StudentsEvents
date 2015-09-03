/**
 * Created by Ken on 18/08/2015.
 */
//@todo: $routeParams $q ?? NEED
app.controller('EditStudentCtrl' , function($scope, Student, Event, $routeParams, $stateParams, $state, $q, lodash){

    var _ = lodash;

    $scope.warning = "";

    $scope.idSelected = [];
    $scope.setSelected = function (_id) {
        if($scope.idSelected.indexOf(_id) > -1){
            $scope.idSelected.splice($scope.idSelected.indexOf(_id), 1);
        }
        else {
            $scope.idSelected.push(_id);
        }
        console.log($scope.idSelected);
    };
    $scope.checkID = function(_id){
        //console.log(_id + " " + ($scope.idSelected.indexOf(_id) > -1));
        return ($scope.idSelected.indexOf(_id) > -1);
    };

    //console.log($stateParams.id);
    if(typeof($stateParams.id) === 'string'){
        $scope.student = Student.get({id: $stateParams.id});
        $scope.eventFields = ['eventName', 'fundedBy', 'startDate', 'endDate'];
        $scope.events = Event.query();
    }
    else{
        $scope.warning = "No information can be found";
        $state.go('all');
    }

    $scope.duplicateEvent = function(_id){
        if($scope.student.events != null)
            return _.some($scope.student.events, { '_id' : _id });
        return false;
    };



    $scope.submit = function(_o){
        if ($scope.student.$invalid) {
            $scope.$broadcast('record:invalid');
        } else {
            if(!$scope.student.events){
                $scope.student.events = [];
            }
            //Get student current event ID only
            console.log("stage 1");
            var currEvent =[];
            for(var i = 0; i< $scope.student.events.length; i++){
                var obj = {
                    _id : $scope.student.events[i]._id,
                    hours: $scope.student.events[i].hours
                }
                currEvent.push(obj);
            }
            console.log(currEvent);
            console.log("stage 2");
            //currEvent.push.apply(currEvent ,$scope.idSelected);
            for(i=0; i<$scope.idSelected.length; i++){
                var obj= {
                    _id : $scope.idSelected[i],
                    hours: 0
                }
                currEvent.push(obj);
            }
            $scope.student.events = currEvent;
            console.log("What will be send to server: " + $scope.student.events);

            Student.put($scope.student, function (success) {
                if(_o == 'all'){
                    $state.go('all');
                }
                console.log("stage 3");
                var temptEvents = [];
                for(var i = 0; i < currEvent.length; i++){
                    console.log(currEvent);
                    var tempt = _.findWhere($scope.events, { '_id' : currEvent[i]._id});
                    if(tempt.hours==null)
                        tempt.hours = 0; // initialize hour
                    tempt.hours = _.result(_.findWhere(currEvent, { '_id' : currEvent[i]._id}), 'hours');

                    if(temptEvents.indexOf(tempt) == -1)
                        temptEvents.push(tempt);
                }
                $scope.student.events = [];
                $scope.student.events = temptEvents;
                $scope.idSelected = [];
                //$state.go('editStudent', {id: $scope.student._id});
            }, function (err) {
                console.log('Err', err);
            });
        }
    };

    $scope.delete = function(_id){
        console.log('Going to delete');
        //hide.bs.modal: This event is fired immediately when the hide instance method has been called.
        //hidden.bs.modal: This event is fired when the modal has finished being hidden from the user (will wait for CSS transitions to complete).
        $('#deleteModal').on('hidden.bs.modal', function () {
            Student.delete({id:_id}, function(){
                    $state.go('all');
                },
                function(err){
                    console.log('Error: ', err);
                });
        });
    };

    $scope.$watch('student.cellPhone', function(){
        if($scope.student != null && $scope.student.cellPhone != null){
            var cell = $scope.student.cellPhone.replace(/[`~!@#$%^&*() _|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
            $scope.student.cellPhone = cell.trim();
            if(cell.length == 10){
                var replaceNumber = cell.substring(0,3) + '-' +
                    cell.substring(3,6) + '-' +
                    cell.substring(6);
                $scope.student.cellPhone = replaceNumber;
            }
            else if(cell.length == 11){
                var replaceNumber = cell.substring(0,4) + '-' +
                    cell.substring(4,7) + '-' +
                    cell.substring(7);
                $scope.student.cellPhone = replaceNumber;
            }
            else if(cell.length == 12){
                var replaceNumber = cell.substring(0,2) + '-' +
                    cell.substring(2,4) + '-' +
                    cell.substring(4,8) + '-' +
                    cell.substring(8);
                $scope.student.cellPhone = replaceNumber;
            }
            else{
                var cell = $scope.student.cellPhone.replace(/[`~!@#$%^&*() _|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
                $scope.student.cellPhone = cell;
            }
        }
    });
});

app.controller('AddStudentCtrl', function($scope, Student, $state){
    $scope.student = { cellPhone: '' };
    $scope.submit = function(option){
        if ($scope.student.$invalid) {
            $scope.$broadcast('record:invalid');
        } else {
            //@todo: test below function
            //$scope.student.$save();
            Student.save($scope.student, function( data){
                console.log(data);
                var _id = "";

                var array = $.map(data, function(value, index) {
                    return [value];
                });
                for (var j = 0; j <24; j++){
                    _id += array[j];
                }
                console.log(_id);
                if(option=='all')
                    $state.go('all');
                if(option=='addEvents')
                    $state.go('editStudent', {id: _id});
            }, function(err, status, data){
                console.log('Error: ', err);
                console.log(status);
                console.log(data);
            });
        }
    };

    $scope.$watch('student.cellPhone', function(){
        var cell = $scope.student.cellPhone.replace(/[`~!@#$%^&*() _|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
        $scope.student.cellPhone = cell.trim();
        if(cell.length == 10){
            var replaceNumber = cell.substring(0,3) + '-' +
                cell.substring(3,6) + '-' +
                cell.substring(6);
            $scope.student.cellPhone = replaceNumber;
        }
        else if(cell.length == 11){
            var replaceNumber = cell.substring(0,4) + '-' +
                cell.substring(4,7) + '-' +
                cell.substring(7);
            $scope.student.cellPhone = replaceNumber;
        }
        else if(cell.length == 12){
            var replaceNumber = cell.substring(0,2) + '-' +
                cell.substring(2,4) + '-' +
                cell.substring(4,8) + '-' +
                cell.substring(8);
            $scope.student.cellPhone = replaceNumber;
        }
        else{
            var cell = $scope.student.cellPhone.replace(/[`~!@#$%^&*() _|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
            $scope.student.cellPhone = cell;
        }
    });
});

