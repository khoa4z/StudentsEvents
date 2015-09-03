/**
 * Created by Ken on 17/08/2015.
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
    router  = express.Router();

var db;
var studentCollection;

MongoClient.connect( dburl.url[0], function(err, database) {
    if(err){
        console.log(err);
        throw err;
    }
    db = database;
    studentCollection = db.collection('students');
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
            if(data)
                res.status(200).send("Inserted");
            else
                res.status(400).send("Cannot insert")
        });
    })
    .put(function(req, res){
        console.log("in the wrong put");
        var student = req.body;
        student._id = new ObjectID( req.body._id);
        req.dbQuery = { _id : new ObjectID( req.body._id) };

        studentCollection.update(req.dbQuery, student, function(err,result){
            if(err){
                res.status(400).send("Cannot update")
                console.log(err);
            }
            else{
                res.status(200).send("Updated");
            }

        });
        delete student.$promise;
        delete student.$resolved;
    });
;
//res.status(200).send("Found");
router.param('id', function(req, res, next){  //Go first
    console.log("Receiving");
    req.dbQuery = { _id : new ObjectID( req.params.id) };
    next();
})
    .route('/student/:id')
    .get(function(req, res){
        studentCollection.findOne(req.dbQuery, function(err, document){
            if(document)
                res.json(document);
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
        studentCollection.remove(req.dbQuery);
        res.status(200).send("Delete");
    });

module.exports = router;
