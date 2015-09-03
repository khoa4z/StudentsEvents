/**
 * Created by Ken on 12/08/2015.
 */
'use strict';

app.filter('label', function(){
   return function(input){
       var _a = input.match(/[A-Z]*[^A-Z]+/g).join(" ");
       return _a[0].toUpperCase() +  _a.slice(1);
   }
});

app.filter('zero', function(){
    return function(input){
        return (input===0)||(input==null)?0:input;
    }
});

app.filter('dateTimeFilter', function(){
       return function(input){
           var _a = input ;
           if(input != null && _a.indexOf(':')>-1 && _a.indexOf('-')>-1){

               var months = [ "January", "February", "March", "April", "May", "June"
                   , "July", "August", "September", "October", "November", "December"];
               var _d = new Date(input);

               var  month_value = _d.getMonth(),
                    day_value   = _d.getDate(),
                    year_value  = _d.getFullYear();

               var str = day_value + " " + months[month_value] + ", " + year_value;
               return str;
           }
           else {
               return _a;
           }
       }
    })
    .filter('dateTimeFilter2', function(){
        return function(input){
            //var _a = input ;
            if(input != null && input.indexOf(':')>-1 && input.indexOf('-')>-1 && input.indexOf('Z')>-1){
                var _d = new Date(input);
                var dd = _d.getDate();
                var mm = _d.getMonth()+1;

                var hh = _d.getHours();
                hh = hh % 12;
                hh = hh ? hh : 12;

                var mi = _d.getMinutes();
                var ampm = (hh < 12)?'AM':'PM';

                if(dd<10)    dd = '0' + dd;
                if(mm<10)    mm = '0' + mm;
                return  mm + '/' + dd + '/' + _d.getFullYear() + " " + hh + ":" + mi + " " + ampm;
            }
            else {
                return input;
            }
        }
    });

app.factory('Student', function($resource){
   //return $resource('api/student');
   return $resource('api/student/:id', {id: '@id'}, {
       'put': { method: 'PUT' },
       //'update': { method: 'PUT' },
       'get'   : { method: 'GET' },
       'delete': { method: 'DELETE'},
       'remove': {method: 'DELETE'}
   });
});

app.factory('Event', function($resource){
    //return $resource('api/event');
    return $resource('api/event/:id', {id: '@id'}, {
        'put': { method: 'PUT' },
        //'update': { method: 'PUT' },
        'get'   : { method: 'GET' },
        'delete': { method: 'DELETE'},
        'remove': {method: 'DELETE'}
    });
});
