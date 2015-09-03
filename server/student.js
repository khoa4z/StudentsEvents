/**
 * Created by Ken on 09/08/2015.
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
    _ = require('lodash');

var db;
var studentCollection, eventCollection;

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
    .route('/student')
    .get(function(req,res) {
        studentCollection.find({}).toArray(function(err, docs){
            if(docs){
                res.json(docs);
            }
            else {
                res.status(404).send("Not found");
            }
        });
    })
    .post(function(req,res){
        var student = req.body;
        studentCollection.insert(student, function(err, data){
            if(data){
                //console.log(data.ops[0]._id);
                //res.status(200).send(data.ops[0]._id);
                res.json(data.ops[0]._id);
            }
            else
                res.status(400).send("Cannot insert")
        });
    })
    //@todo: recheck this one
    .put(function(req, res){
        var student = req.body;
        console.log(student);
        student._id = new ObjectID( req.body._id);
        req.dbQuery = { _id : new ObjectID( req.body._id) };

        studentCollection.findOne(req.dbQuery, function(err, document) {
            if(document){
                var currEvents = document.events;
                var newEvents  = student.events;

                if(student.events!= null){
                    for(var i=0; i < student.events.length; i++){
                        student.events[i]._id = new ObjectID(student.events[i]._id);
                    }
                }
                studentCollection.update(req.dbQuery, student, function(err){ //function(err,result){
                    if(err){
                        res.status(400).send("Cannot update");
                    }
                    else{
                        //Add Student to event
                        console.log("taking out duplicate");
                        console.log("CurrEvents");
                        console.log(currEvents);
                        console.log("newEvents");
                        console.log(newEvents);
                        if(currEvents!=null && currEvents.length > 0){
                            for(i = 0; i < currEvents.length; i++){
                                var _p = _.findWhere(newEvents, { '_id' : currEvents[i]._id});
                                console.log("_p");
                                console.log(_p);
                                if( _p ){
                                    //console.log('slicing');
                                    newEvents.splice( _p ,1);       //slice to not update in eventCollection
                                }
                            }
                        }

                        //This code under only add Students._id to eventCollection
                        if(newEvents!=null && newEvents.length > 0) {
                            console.log("newEvents: "+ newEvents);
                            console.log( newEvents);
                            var _e = [];
                            for(i = 0; i < newEvents.length; i++){
                                newEvents[i]._id = new ObjectID( newEvents[i]._id);
                                _e.push(newEvents[i]._id);
                            }
                            console.log("before Update");
                            console.log(_e);
                            eventCollection.update( { _id: {$in: _e}},
                                                    { $push: { students: document._id } },
                                                    { multi: true }, function(err,result){});
                        }


                        //@todo: update hours inside students inside eventCollection
                        // if(newEvents!=null && newEvents.length > 0) {
                        //     console.log("New CODE");
                        //     for(i = 0; i < newEvents.length; i++){
                        //         console.log("Update: " + i);
                        //         console.log(newEvents[i]);
                        //         //eventCollection.update(
                        //         //    { _id: newEvents[i]._id, students: {$in: {_id: document._id}}},
                        //         //    { $set: {hours: newEvents[i].hours }},
                        //         //    { upsert: true }, function(err,result){});
                        //         eventCollection.update(
                        //             { _id: newEvents[i]._id, students: {$in: {_id: document._id}}},
                        //             { $set: {"hours.$": newEvents[i].hours }},
                        //             { upsert: true }, function(err,result){});
                        //
                        //     }
                        // }

                        res.status(200).send("Updated");
                    }

                });
            }
            else{
                res.status(400).send("Cannot update. Student does not exist");
            }
        });


        delete student.$promise;
        delete student.$resolved;
    });

//res.status(200).send("Found");
router.param('id', function(req, res, next){  //Go first
        console.log("Receiving");
        req.dbQuery = { _id : new ObjectID( req.params.id) };
        next();
    })
    .route('/student/:id')
    .get(function(req, res){
        studentCollection.findOne(req.dbQuery, function(err, document){
            if(document){
                console.log(document);
                var student = document;
                if(student.events != null && student.events.length > 0){
                    var _e = [];
                    for(var i = 0; i < student.events.length; i++){
                        _e.push(new ObjectID( student.events[i]._id));
                    }
                    eventCollection.find({ _id: {$in: _e}}).toArray(function(err, docs){
                        if(docs){
                            var docs2 = [];

                            for(var i = 0; i < document.events.length; i++){
                                var tempt = _.findWhere(docs, { '_id' : document.events[i]._id});
                                if(tempt != null){ //remove when solve delete issue
                                    tempt.hours = document.events[i].hours;
                                    docs2.push(tempt);
                                }
                            }
                            console.log(docs2);
                            //add hours with events together
                            document.events = docs2;
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
    //.put( function(req, res){
    //    console.log("in router 6");
    //    var contact = req.body;
    //    console.log("contact " + contact);
    //    delete contact.$promise;        //angular use add to object
    //    delete contact.$resolved;       //they are sent to server, delete so it isn't stored
    //})
    .delete(function(req,res){
        console.log("deleting");
        studentCollection.findOne(req.dbQuery, function(err, document){
           if(document){
               var es = document.events;
               var _e = [];
               if(es != null){
                   for(var i = 0; i < es.length; i++){
                       _e.push(es[i]._id);
                   }
                   eventCollection.update( { _id: {$in: _e}},
                       { $pull: { students: document._id } },
                       { multi: true }, function(err,result){});
               }
               studentCollection.remove(req.dbQuery);
           }
           else
               res.status(400).send("Cannot perform the action");
        });
        res.status(200).send("Delete");
    });

module.exports = router;

/*
 @completed:
 C : completed
 R : completed
 U : completed
 D : completed
 */