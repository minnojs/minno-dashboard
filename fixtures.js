/* eslint-env node */

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/studies', (req,res)=>{
	res.json({studies: [
		{id:'asd1', name:'Study 1'},
		{id:'asd2', name:'Study 2'},
		{id:'asd3', name:'Study 3'}
	]});
});

var files = [
	{
		'id': 'imageTest.js',
		'url': '/test/imageTest.js'
	},
	{
		'id': 'example.js',
		'url': '/test/example.js'
	},
	{
		'id': 'left.jst',
		'url': '/test/templates/left.jst'
	},
	{
		'id': 'wf3_nc.jpg',
		'url': '/test/images/wf3_nc.jpg'
	}
];

router.route('/files/:studyID')
	.get((req,res)=>{
		res.json({
			files: files
		});
	});

router.route('/files/:studyID/file')
	.post((req,res)=>{
		res.json({id:Math.random(), url:'/test/new.js'});
	});

router.route('/files/:studyID/file/:id')
	.get((req,res)=>{
		var file = files.find(f => f.id == req.params.id);
		fs.readFile('..' + file.url, function read(err, data) {
			if (err) {throw err;}
			res.json(Object.assign({content: new String(data)},file));
		});
	})
	.put((req)=>{
		console.log('saved ' + req.params.id);
	})
	.delete((req,res)=>{
		console.log('del ' + req.params.id);
		res.json();
	});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /dashboard
app.use('/dashboard/dashboard', router);
app.use(express.static('.'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
