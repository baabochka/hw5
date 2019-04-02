var express = require('express');
var router = express.Router();
var assert = require('assert')

var multer  = require('multer')
var upload = multer({})
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
      const params = [fname, req.file.buffer];
      client.execute(query, params, {prepare: true}, function (err) {
        // assert.ifError(err);

      });
    } catch (e) {
      res.json({status: 'ERROR'});
    }
  console.log("I got filename: ", fname, " and body: ", cont);
  res.json({status: "OK"});
});


//retrieve
router.get('/retrieve', function(req, res){
  fname = req.body.filename;
  const query = "SELECT filename FROM imgs WHERE key = fname";
  client.execute(query, function (err, result) {
    var img = result.first();
    //The row is an Object with column names as property keys.
    console.log('My file is this: ', img);
  });
  console.log("I got filename: ", fname);
  res.json({status: "OK", contents: img});
});



module.exports = router;
