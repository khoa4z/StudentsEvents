'use strict';

var express = require('express'),
    path    = require('path'),
    log		= require('winston').loggers.get('app:server'),
    app     = express();

var student = require('./student'),
    event   = require('./event');

var config  = {
    "port"  : 3007,
    "ip"    : "127.0.0.1"
};

/* Use to shortcut the link in main.html file */
//app.use(express.static(path.join(__dirname + '/../bower_components/')));
//app.use(express.static(path.join(__dirname + '/../public/')));

app.use(express.static(path.join(__dirname + '/../')));
app.use(express.static('../public/..'));
app.use(express.static(path.join(__dirname + '/../public/'))); // static serving all files in public



app.use('/api', student);           //must specify before
app.use('/api', event);           //must specify before


app.get('*', function (req, res) {
        //res.sendFile(path.join('/public/main.html'), {"root": "."});
    res.sendFile(path.join('/public/main.html'), {"root": "../"});

});

app.listen(config.port, config.ip, function (err) {
    if (err) {
        log.error('Unable to listen for connections', err);
        process.exit(10);
    }
    log.info('Magic happens in http://' +
    config.ip + ':' + config.port);
});