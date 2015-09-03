/**
 * Created by Ken on 16/08/2015.
 */
'use strict';
var dburl = {
    "url" : [
        "mongodb://123:456@ds059692.mongolab.com:59692/template",
        "mongodb://123:456@ds033153.mongolab.com:33153/template2"
    ]
};

var express = require('express'),
    path    = require('path'),
    log		= require('winston').loggers.get('app:server'),
    bodyParser  = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    ObjectID = require('mongodb').ObjectID,
    MONGODB_URI = "mongodb://localhost:27017/template",
    router  = express.Router(),
    _     = require('lodash');

var db;
var eventCollection,studentCollection;

MongoClient.connect( dburl.url[0], function(err, database) {
    if(err){
        console.log(err);
        throw err;
    }
    db = database;
    studentCollection = db.collection('students');
    eventCollection = db.collection('events');
});



router    //.use(bodyParser())
    .use(bodyParser.urlencoded({
        extended: true
    }))
    .use(bodyParser.json())
    .use(function (req, res, next){
        next();
    })
    .route('/event')
    .get(function(req,res) {
        eventCollection.find({}).toArray(function(err, docs){
            if(docs){
                res.json(docs);
            }
            else {
                res.status(404).send("Not found");
            }
        });
    })
    .post(function(req,res){
        var event = req.body;
        event.startDate = new Date(event.startDate).toISOString();
        event.endDate = new Date(event.endDate).toISOString();

        eventCollection.insert(event, function(err, data){
            if(data)
                res.json(data.ops[0]._id);
            else
                res.status(400).send("Cannot insert")
        });
    })
    .put(function(req, res){
        var event = req.body;
        event._id = new ObjectID( req.body._id);
        req.dbQuery = { _id : new ObjectID( req.body._id) };

        //Event, Event, Student
        eventCollection.findOne( req.dbQuery, function(err, document){
            if(document){
                var e = document;
                var currentStudents = e.students;
                var newStudents     = event.students;
                //replace NewStudents with currentStudents
                if(newStudents != null){
                    var studentIDarray = [];
                    for(var i = 0 ; i<newStudents.length; i++){
                        studentIDarray.push( newStudents[i]._id);
                    }
                    event.students = studentIDarray;
                }

                eventCollection.update(req.dbQuery, event, function(err, result){
                    if(err)
                        res.status(400).send("Cannot update");
                    else{
                        res.status(200).send("Updated");    //res send back right here, everything else in background
                    }
                });

                //Student Stage, only Change in newStudents
                //Has to perform search before update -> so use newStudents to perform update
                if(newStudents != null && newStudents.length > 0){
                    var _ss = [];       //only for searching,
                    for(var i = 0; i < newStudents.length; i++){
                       _ss.push( new ObjectID(newStudents[i]._id));
                    }

                    //@todo: minimize the return,
                    //using docs, newStudents,
                    console.log('newStudents: ');
                    console.log(newStudents);
                    studentCollection.find({ _id: {$in: _ss }}).toArray(function(err, docs){
                        if(docs != null && docs.length > 0 ){
                            for(var k = 0; k < docs.length; k++){

                                var eventsInS = docs[k].events; //nullable
                                var e         = _.findWhere(eventsInS, {'_id': event._id } );//nullable too

                                var newEvent  = {
                                    _id    :  event._id,
                                    hours  : _.result(_.findWhere(newStudents, {_id: docs[k]._id.toString() }), 'hours')
                                };
                                console.log("e is");
                                console.log(e);
                                console.log("newEvent is");
                                console.log(newEvent);


                                var query = { _id : new ObjectID( docs[k]._id) };

                                if(eventsInS == null || e == null){ // PUSH
                                    console.log("Push to the STUDENT")
                                    studentCollection.update(
                                        query,
                                        {$push: { events: newEvent }},
                                        {$upsert: true},
                                        function(err, result){}
                                    );
                                }
                                if(e != null && e.hours != newEvent.hours){  //PULL and PUSH
                                    console.log("pull & push");
                                    //for(var m = 0; m < eventsInS.length; m++){
                                    //    if(eventsInS[m]._id == event._id){
                                    //        eventsInS[m].hours = newEvent.hours;
                                    //    }
                                    //}
                                    //console.log("Update with this eventsInS");
                                    //console.log(eventsInS);

                                    e.hours = newEvent.hours;
                                    console.log(eventsInS);

                                    studentCollection.update(
                                        query,
                                        { $set: { events: eventsInS }},
                                        {$upsert: true},
                                        function(err, result){}
                                    );

                                }
                                console.log("************");
                            }
                        }
                    });
                }


            }
            else
                res.status(400).send("Not Found");
        });

        //eventCollection.update(req.dbQuery, event, function(err,result){
        //    if(err){
        //        res.status(400).send("Cannot update")
        //    }
        //    else{
        //        res.status(200).send("Updated");
        //    }
        //});

        //res.status(200).send("Updated");


        delete event.$promise;
        delete event.$resolved;
    })
;

//res.status(200).send("Found");
router.param('id', function(req, res, next){  //Go first
    console.log("Receiving");
    req.dbQuery = { _id : new ObjectID( req.params.id) };
    next();
})
    .route('/event/:id')
    .get(function(req, res){
        eventCollection.findOne(req.dbQuery, function(err, document){
            console.log(document);
            if(document){
                var event = document;
                if(event.students != null && event.students.length > 0){
                    var _ss = []
                    for(var i = 0; i < event.students.length; i++){
                        event.students[i] = new ObjectID( event.students[i]);
                        //_ss.push() event.students[i]);
                    }
                    studentCollection.find({ _id: {$in: event.students }}).toArray(function(err, docs){
                        if(docs){
                            var docs2 = [];
                            console.log("docs.count" + docs.length);
                            for(var i = 0; i < docs.length; i++){
                                var hour = 7;
                                //var _p = _.findWhere(newEvents, { '_id' : currEvents[i]._id});

                                hour = _.result(_.findWhere(docs[i].events, {'_id' : document._id}), 'hours');
                                var _es = {
                                    _id : docs[i]._id,
                                    firstName: docs[i].firstName,
                                    lastName: docs[i].lastName,
                                    hours    : hour,
                                    email    : docs[i].email,
                                    cellPhone: docs[i].cellPhone
                                };
                                docs2.push(_es);
                            }
                            document.students = docs2;
                            console.log(document);
                            res.json(document);
                        }
                        else{
                            res.status(404).send("Not found");
                        }
                    });
                }
                else{
                    res.json(document);
                }
            }
            else
                res.status(404).send("Not found");
        });
    })
    .delete(function(req,res){
        //eventCollection.remove(req.dbQuery);
        console.log("Deleting");
        eventCollection.findOne(req.dbQuery, function(err, document){
            if(document){
                var ss = document.students;
                if(ss != null && ss.length > 0){
                    //because ss contains only objID
                    console.log(ss);
                    for( var i in ss){
                        ss[i] = new ObjectID(ss[i]);
                    }
                    studentCollection.update({_id: {$in: ss}},
                                             { $pull: {events: { _id: document._id} }},
                                             { multi: true }, function (err, result){ console.log("result"); console.log(result);});
                }
                eventCollection.remove(req.dbQuery);
            }
            else
                res.status(400).send("Cannot perform the action");
        });
        res.status(200).send("Delete");
    });

module.exports = router;


/*
@todo:
    C : completed
    R : completed
    U :
    D : completed
 */