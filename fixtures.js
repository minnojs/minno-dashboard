/* eslint-env node */

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var fs = require('fs');
var isMac = process.platform === 'darwin';

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

var files = isMac
	? [
		{
			id: 'iatExtenssion.js',
			url: '/test/iatExtenssion.js',
			noDel: true
		},
		{
			id: 'aaa.pdf',
			url: '/test/aaa.pdf'
		},
		{
			id: 'example.js',
			url: '/test/example.js'
		},
		{
			id: 'exp.xml',
			url: '/test/exp.xml'
		}
	]
	: [
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

files.push({id:'images', url:'/test/images', isDir:true});
files.push({id:'someFile.grg', url:'/test/someFile.grg'});

router.route('/files/:studyID')
	.get((req,res)=>{
		res.json({
			files: files
		});
	});

router.route('/files/:studyID/file')
	// create file
	.post((req,res)=>{
		res.json({id: req.body.name, url:`/test/${req.body.name}`});
	});

router.route('/files/:studyID/file/:id')
	// get file data
	.get((req,res)=>{
		var file = files.find(f => f.id == req.params.id);

		if (!file) return res.status(404).json({message:'File not found'});

		if (/(jst|html|xml|js)$/.test(file.url)){
			fs.readFile('..' + file.url, function read(err, data) {
				if (err) {throw err;}
				res.json(Object.assign({content: new String(data)},file));
			});
		} else {
			res.json(file);
		}
	})
	// update file
	.put((req, res)=>{
		res.status(403);
	})
	// delete file
	.delete((req,res)=>{
		if (files.some(f => f.id == req.params.id && f.noDel)) {
			res.status(403).json({message:'del ' + req.params.id + ' failed'});
		}
		res.end();
	});


var adminRouter = express.Router();
adminRouter.route('/studyData')
	.post((req,res)=> {
		var data = [];
		for (var i=0; i<10; i++){
			data.push({
				studyId:(0|Math.random()*9e6).toString(36),
				studyUrl:(0|Math.random()*9e6).toString(36),
				rulesUrl:(0|Math.random()*9e6).toString(36),
				// autopauseUrl,
				targetCompletions: Math.random() * 100,
				startedSessions: Math.random() * 100,
				completedSessions: Math.random() * 100,
				creationDate:new Date() * Math.random(),
				studyStatus: Math.random()>0.5?'R':'P'
			});
		}
		res.json(data);
	});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /dashboard
app.use('/dashboard/dashboard', router);
app.use('/admin', adminRouter);
app.use(express.static('..'));

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
