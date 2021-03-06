var express = require('express');
var router = express.Router();
var assert = require('assert')

var multer  = require('multer')
var upload = multer()
const cassandra = require('cassandra-driver');

// const client = new cassandra.Client({
//   contactPoints: ['127.0.0.1'],
//   localDataCenter: 'datacenter1'
// });

// client.connect(function (err) {
//   assert.ifError(err);
//   console.log('cassandra connected');
// });

var dbConfig = {
  contactPoints : ['127.0.0.1'],
  keyspace:'hw5',
  localDataCenter: 'datacenter1'
};

var client = new cassandra.Client(dbConfig);

client.connect(function(err,result){
  console.log('cassandra connected');
});



/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/deposit', function (req, res, next) {
  res.sendfile('public/deposit.html');
});

//deposit
router.post('/deposit', upload.single('contents'), function(req, res){
  fname = req.body.filename;
  cont = req.file.buffer;

    try {
      const query = 'INSERT INTO imgs (filename, contents) VALUES (?, ?)';
      const params = {filename: fname, contents: req.file.buffer};
      client.execute(query, params, {prepare: true}, function (err, result) {
        // assert.ifError(err);
        if(err) {
          console.log("Couldn't deposit image into database.");
        }
      });
    } catch (e) {
      res.json({status: 'ERROR'});
    }
  console.log("I got filename: ", fname, " and body: ", cont);
  res.json({status: "OK"});
});

// router.get('/retrieve', function (req, res, next) {
//   res.sendfile('public/retrieve.html');
// });
//retrieve
router.get('/retrieve', function(req, res){ ///:filename

  console.log("filename requested: ", req.query.filename);
  const query = "SELECT contents FROM hw5.imgs WHERE filename = ?";
  client.execute(query, [req.query.filename],function (err, result) {
    if(err) {
      res.json({status: 'ERROR'});
    }

    res.type(req.query.filename.split('.')[1]).send(result.first().contents);
    // res.send({status: "OK", contents: img});
    //The row is an Object with column names as property keys.
    // console.log('My file is this: ', img);
  });
  // console.log("I got filename: ", fname);

});



module.exports = router;
