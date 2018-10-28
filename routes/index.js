'use strict';

var express = require('express');
var router = express.Router();
var url = "mongodb://localhost:27017";
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var engines = require('consolidate');
var path = require('path');
var assert = require('assert');

var csv = require('csv-express');
var Importcsv = require("fast-csv");
var fs = require('fs');
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var xoauth2 = require('xoauth2');

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mydb');

/*
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
    console.log("Connection Successful!");    
});
*/

require("../models/Users");
var Users = mongoose.model('Users');

var csvfile = __dirname + "/../public/files/users.csv";
var stream = fs.createReadStream(csvfile);

var app = express();

// view engine setup
app.engine('html', engines.nunjucks);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

/* GET home page. */
console.log(path.resolve(__dirname, '/views/index.html'));
console.log(__dirname);
console.log(path.join(__dirname, 'views'));
console.log(path.join(__dirname, '../views/index.html'));
//app.use(Express.static(path.join(__dirname, '..', '..', 'client'), { dotfiles: 'allow' }))

router.get('/', function (req, res, next) {
    Users.find({}, function (err, docs) {
        if (err)
            res.send(err);
        res.sendFile(path.join(__dirname, '../views/index.html'));
    });
});

/*

router.get('/', function (req, res, next) {
    Users.find({}, function (err, docs) {
        if (err)
            res.send(err);
        res.render('dbCRUD', { title: 'Nodejs MongoDB export to CSV', data: docs });
    });
});

/*
router.get('/', function (req, res) {
    MongoClient.connect(url, function (err, client) {
        if (err) { throw err; }
        //console.log("test");
        var db = client.db("mydb");
        //db.collection('Users').find({ _id: new mongodb.ObjectID(id) }).toArray(function (err, docs) {
        db.collection('Users').find({}).toArray(function (err, docs) {
            if (err) throw err;
            console.log(docs);
            //res.send(docs);
            res.render('dbCRUD.html', { data: docs });
            client.close();
        });
    });
});


router.get('/fetch', function (req, res, next) {
    var id = req.query.id;
    MongoClient.connect(url, function (err, client) {
        if (err) { throw err; }
        var db = client.db("mydb");
        db.collection('Users').find({ _id: new mongodb.ObjectID(id) }).toArray(function (err, docs) {
            if (err) throw err;
            console.log(docs);
            res.send(docs);
            client.close();
        });
    });
});

router.post('/add', function (req, res, next) {
    MongoClient.connect(url, function (err, client) {
        if (err) { console.log(err); throw err; }
        var db = client.db("mydb");
        var collection = db.collection("Users");
        console.log("Mongo Connection");
        var User = { firstName: req.body.firstName, lastName: req.body.lastName };
        collection.insert(User, function (err, result) {
            console.log("User Created");
            client.close();
            res.redirect('/');
        });
    });
});

router.get('/delete', function (req, res, next) {
    var id = req.query.id;
    MongoClient.connect(url, function (err, client) {
        if (err) { throw err; }
        var db = client.db("mydb");
        var collection = db.collection("Users");
        collection.deleteOne({ '_id': new mongodb.ObjectId(id) }, function (err, result) {
            if (err) {
                throw err;
            } else {
                client.close();
                res.redirect('/');
            }
        });
    });
});

router.post('/edit', function (req, res, next) {
    var id = req.body.id;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    MongoClient.connect(url, function (err, client) {
        if (err) { throw err; }
        var db = client.db("mydb");
        var collection = db.collection("Users");
        collection.updateOne({ _id: new mongodb.ObjectId(id) }, { $set: { 'firstName': firstName, 'lastName': lastName } }, function (err, result) {
            if (err) {
                throw err;
            } else {
                client.close();
                res.redirect('/');
            }
        });
    });
});

router.get('/exporttocsv', function (req, res, next) {
    var filename = "users.csv";
    var dataArray;
    Users.find().lean().exec({}, function (err, docs) {
        if (err) res.send(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader("Content-Disposition", 'attachment; filename=' + filename);
        res.csv(docs, true);
    });
});

router.get('/import', function (req, res, next) {
    var users = []
    var csvStream = csv()
        .on("data", function (data) {
            var item = new User({
                firstName: data[0],
                lastName: data[1]
            });

            item.save(function (error) {
                console.log(item);
                if (error) {
                    throw error;
                }
            });
        }).on("end", function () {
            console.log(" End of file import");
        });
    stream.pipe(csvStream);
    res.json({ success: "Data imported successfully.", status: 200 });
});

*/
router.post('/send', function (req, res) {
    console.log("sks email post: " + req.body.to);    
    var transporter = nodemailer.createTransport(smtpTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        auth: {
            xoauth2: xoauth2.createXOAuth2Generator({
                user: 'xxxx@gmail.com',
                clientId: 'test187779425111-d8amgtm37p0iobr8grbpvqdubjglrd8o.apps.googleusercontent.com',
                clientSecret: 'testjMSTSJrI4cTK26y54mmxtYZ1',
                refreshToken: 'test1/JE5WPAj1gbEiSIc1k72-26FZQMoEdHX6sEoQ5nzkom8'
            })
        }
    }));

    var mailOptions = {
        to: req.body.to,
        subject: req.body.subject,
        text: req.body.text,
        from: 'xxxx@gmail.com',
        html: '<h1>Welcome</h1><p>NodeJS & MongoDB is a fun!</p>',
        bcc: "xxxx@gmail.com"
    }

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
            res.end("error");
        } else {
            console.log('Email sent: ' + info.response);
            res.end("sent");
        }
    });
});

module.exports = router;