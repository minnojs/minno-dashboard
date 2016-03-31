define(['pipAPI','pipScorer'], function(APIConstructor,Scorer) {

	var API = new APIConstructor();
	var scorer = new Scorer();
	var piCurrent = API.getCurrent();

	function getCategoryImages(inCatName)
	{
		if (inCatName == 'White People')
		{
			return ([
			{image: 'wf3_nc.jpg'},
			{image: 'wf6_nc.jpg'},
			{image: 'wf2_nc.jpg'},
			{image: 'wm6_nc.jpg'},
			{image: 'wm1_nc.jpg'},
			{image: 'wm4_nc.jpg'}
			]);
		}
		else
		{
			return([
				{image: 'bm56_nc.jpg'},
				{image: 'bm23_nc.jpg'},
				{image: 'bm14_nc.jpg'},
				{image: 'bf56_nc.jpg'},
				{image: 'bf23_nc.jpg'},
				{image: 'bf14_nc.jpg'}
			]);
		}
	}
	function setPos(hero) {
	  hero.style.marginTop = 0;
	  var top = ((document.body.clientHeight - hero.clientHeight)/2) + "px";
	  hero.style.marginTop = top;
	}
	var attribute1 = 'Positive Words';
	var attribute2 = 'Negative Words';
	var cats = API.shuffle(['White People', 'Black People']);
	var category1 = cats[0];
	var category2 = cats[1];


	//the source of the images and some templates
	API.addSettings('base_url',{
		image : '/test/images/',
		template : '/test/templates/'
	});

	//Send to the server every 20 trials.
	API.addSettings('logger',{
		pulse: 20,
		url : '/implicit/PiPlayerApplet'
	});
	API.addSettings('hooks',{
					endTask: function(){
						var DScoreObj = scorer.computeD();
						piCurrent.feedback = DScoreObj.FBMsg;
					}
				});



	//Set the screen settings
	API.addSettings('canvas',{
		maxWidth: 480,
		proportions : 0.8,
		background: '#000000',
		borderWidth: 5,
		canvasBackground: '#474747',
		borderColor: 'white'
	});

	//The scorer computes the user feedback
	scorer.addSettings('compute',{
		ErrorVar:'score',
		condVar:"condition",
		//condition 1
		cond1VarValues: [
			attribute1 + ',' + category2 + '/' + attribute2 + ',' + category1
		],
		//condition 2
		cond2VarValues: [
			attribute1 + ',' + category1 + '/' + attribute2 + ',' + category2
		],
		fastRT : 150, //Below this reaction time, the latency is considered extremely fast.
		maxFastTrialsRate : 0.1, //Above this % of extremely fast responses within a condition, the participant is considered too fast.
		minRT : 400, //Below this latency
		maxRT : 10000, //above this
		errorLatency : {use:"latency", useForSTD:true},//do not ignore error respones when computing the D
		postSettings : {score:"score",msg:"feedback",url:"/implicit/scorer"}
	});

	scorer.addSettings('message',{
		MessageDef: [
		{ cut:'-0.65', message:'Your data suggest a strong implicit preference for ' + category2 + ' compared to ' + category1 + '.' },
		            { cut:'-0.35', message:'Your data suggest a moderate implicit preference for ' + category2 + ' compared to ' + category1 + '.' },
		            { cut:'-0.15', message:'Your data suggest a slight implicit preference for ' + category2 + ' compared to ' + category1 + '.' },
		            { cut:'0.15', message:'Your data suggest little to no difference in implicit preference between ' + category2 + ' and ' + category1 + '.' },
		            { cut:'0.35', message:'Your data suggest a slight implicit preference for ' + category1 + ' compared to ' +  category2 + '.' },
		            { cut:'0.65', message:'Your data suggest a moderate implicit preference for ' + category1 + ' compared to ' + category2 + '.' },
		            { cut:'0.66', message:'Your data suggest a strong implicit preference for ' + category1 + ' compared to ' +  category2 + '.' }
		]
	});

	/**
	 * Create default Trial
	 * note that this function takes a single object
	 */
	API.addTrialSets('Default',{
		// by default each trial is correct, this is modified in case of an error
		data: {score:0},

		// set the interface for trials
		input: [
			{handle:'ykey',on:'keypressed', key:'y'}, //The "skip" input
			{handle:'left',on:'keypressed',key:'e'}, //Left response
			{handle:'right',on:'keypressed',key:'i'}, //Right response
			{handle:'left',on:'click',  element:$('<div>')
                    .css({
                        position: 'absolute',
                        left: 0,
                        width: '30%',
                        height: '100%',
                        background: '#0000FF',
                        opacity: 0.0
                    })},

			 {handle:'right', on:'click',  element:$('<div>')
                    .css({
                        position: 'absolute',
                        right: 0,
                        width: '30%',
                        height: '100%',
                        background: '#0000FF',
                        opacity: 0.0
                    })}
		],

		// constant elements in the display, in this case: the user instructions: left / right
		layout: [
			{inherit:{type:'byData',set:'layout',data:'left'}},
			{inherit:{type:'byData',set:'layout',data:'right'}},
			{inherit:{type:'byData',set:'layout',data:'lefttouchzone'}},
			{inherit:{type:'byData',set:'layout',data:'righttouchzone'}}
		],

		// user interactions
		interactions: [
			// begin trial : display stimulus immediately
			{
				conditions: [{type:'begin'}],
				actions: [{type:'showStim',handle:'myStim'}]
			},

			// error response
			{
				conditions: [
					{type:'inputEqualsStim',property:'side',negate:true},	// check if the input handle is unequal to the "side" attribute of stimulus.data
					{type:'inputEquals',value:['left', 'right']}
				],
				actions: [
					{type:'showStim',handle:'error'}, // show error stimulus
					{type:'setTrialAttr', setter:{score:1}} // set the score to 1 (this is trial_error)
				]
			},

			// correct
			{
				conditions: [{type:'inputEqualsStim',property:'side'}],	// check if the input handle is equal to the "side" attribute of stimulus.data
				actions: [
					{type:'removeInput',handle:['left','right']},
					{type:'hideStim', handle: 'All'},								// hide everything
					{type:'log'},													// log this trial
					{type:'setInput',input:{handle:'end', on:'timeout',duration:250}} // trigger the "end action after ITI"
				]
			},

			// end after ITI
			{
				conditions: [{type:'inputEquals',value:'end'}],
				actions: [
					{type:'endTrial'}
				]
			},

			// skip block -> if you press 'b' after pressing 'y'.
			{
				conditions: [{type:'inputEquals',value:'ykey'}],
				actions: [
					{type:'setInput',input:{handle:"bkey",on: 'keypressed', key:'b'}} //No we're waiting for a 'b' response.
				]
			},
			// skip block -> if you press 'b' after pressing 'y'.
			{
				conditions: [{type:'inputEquals',value:'bkey'}],
				actions: [
					{type:'goto', destination: 'nextWhere', properties: {blockStart:true}},
					{type:'endTrial'}
				]
			}
		],

					customize : function(trialSource, globalObject){
			          // push a stimulus into the stimulus array

				}
	});

	/**
	 * Create default instructions trials
	 * note that this function takes an array of objects
	 */
	API.addTrialSets("instructions", [
		// generic instructions trial, to be inherited by all other instructions trials
		{
			// set block as generic so we can inherit it later
			data: {block: 'generic'},

			// create user interface (just click to move on...)
			input: [
				{handle:'space',on:'space'},
				{handle:'space',on:'bottomTouch',touch:true},

			],


			interactions: [
				// display instructions
				{
					conditions: [{type:'begin'}],
					actions: [
						{type:'showStim',handle:'All'}
					]
				},

				// end trial
				{
					conditions: [{type:'inputEquals',value:'space'}],
					actions: [{type:'endTrial'}]
				}
			]
		}
	]);

	/**
	 * Create specific trials for each block
	 */
	API.addTrialSets("IAT", [

		// block1
		{
			data: {block:1, left2:category1, right2:category2, condition: category1 + '/' + category2},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block2
		{
			data: {block:2, left1 : attribute1, right1:attribute2, condition: attribute1 + '/' + attribute2},
			inherit: 'Default',													// inherit the default trial
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block3
		{
			data: {block:3, row:1, left1:attribute1, right1:attribute2, left2:category1, right2:category2, condition: attribute1 + ',' + category1 + '/' + attribute2 + ',' + category2,parcel:'first'},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		{
			data: {block:3, row:2, left1:attribute1, right1:attribute2, left2:category1, right2:category2, condition: attribute1 + ',' + category1 + '/' + attribute2 + ',' + category2,parcel:'first'},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block4
		{
			data: {block:4, left2:category2, right2:category1, condition: category2 + '/' + category1},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_right'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		// block5
		{
			data: {block:5, row:1, left1:attribute1, right1:attribute2, left2:category2, right2:category1, condition: attribute1 + ',' + category2 + '/' + attribute2 + ',' + category1,parcel:'first'},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'category1_right'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		},

		{
			data: {block:5, row:2, left1:attribute1, right1:attribute2, left2:category2, right2:category1, condition: attribute1 + ',' + category2 + '/' + attribute2 + ',' + category1,parcel:'first'},
			inherit: 'Default',
			stimuli: [
				{inherit:{type:'exRandom',set:'attribute1_left'}},
				{inherit:{type:'random',set:'feedback'}}
			]
		}
	]);

	/*
	 *	Stimulus Sets
	 *
	 */
	API.addStimulusSets({
		// This Default stimulus is inherited by the other stimuli so that we can have a consistent look and change it from one place
		Default: [
			{size: {width:32.5, height:24.25},css:{color:'#0099ff','font-size':'2.3em'},
			location: {left:33.75,top:37.8},}
		],


		Instructions: [
			{location:{bottom:30},css:{'font-size':'1.4em',color:'white',lineHeight:1.2, margin:'2%'}}
		],

		// The trial stimuli
		// Each stimulus set holds the left and right stimuli for a specific page settings (is the first attribute/category in the left or right?)
		// Notably the attribute/category sets repeat themselves 5 times each, this is so that when calling them they will be balanced across each ten trials
		attribute1_left : [
			{data:{side:'left', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'right', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'left', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'right', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}}
		],
		attribute1_right : [
			{data:{side:'left', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'right', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}},
			{data:{side:'left', handle:'myStim', alias:attribute2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute2'}}},
			{data:{side:'right', handle:'myStim', alias:attribute1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'attribute1'}}}
		],
		category1_left: [
			{data:{side:'left', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'right', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'left', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'right', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}}
		],
		category1_right : [
			{data:{side:'left', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'right', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}},
			{data:{side:'left', handle:'myStim', alias:category2}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category2'}}},
			{data:{side:'right', handle:'myStim', alias:category1}, inherit:'Default', media: {inherit:{type:'exRandom',set:'category1'}}}
		],

		// this stimulus used for giving feedback, in this case only the error notification
		feedback : [
			{handle:'error', location: {top: 80}, css:{color:'red','font-size':'4em'}, media: {word:'X'}, nolog:true}
		],

		layout: [
			{data:{handle:'left'},location:{left:0,top:0},css:{color:'white',fontSize:'1.5em', margin:'2%',lineHeight:1.2},media:{template:'left.jst'}},
			{data:{handle:'right'}, location:{left:'auto',right:0,top:0},css:{color:'white',fontSize:'1.5em', margin:'2%',lineHeight:1.2},media:{template:'right.jst'}},
			{data:{handle:'blocktext'},location:{left:50,top:60}},
			{data:{handle:'lefttouchzone'},location:{left:0,top:0},css:{  position: 'absolute',left: 0,width: '30%',height: '100%',background: '#00FF00',opacity: 0.3},media: {word:' '},},
			{data:{handle:'righttouchzone'},location:{right:0,top:0},css:{  position: 'absolute',right: 0,width: '30%',height: '100%',background: '#00FF00',opacity: 0.3},media: {word:' '},}
		]
	});

	API.addMediaSets({
		attribute1 : [
			{word: 'Joy'},
			{word: 'Love'},
			{word: 'Peace'},
			{word: 'Wonderful'},
			{word: 'Pleasure'},
			{word: 'Glorious'},
			{word: 'Laughter'},
			{word: 'Happy'}

		],
		attribute2: [
			{word: 'Agony'},
			{word: 'Terrible'},
			{word: 'Horrible'},
			{word: 'Nasty'},
			{word: 'Evil'},
			{word: 'Awful'},
			{word: 'Failure'},
			{word: 'Hurt'}

		],
		category1: getCategoryImages(category1),
		category2: getCategoryImages(category2)
	});

	/*
	 *	Create the Task sequence
	 */
	API.addSequence([

		// block 1
		// block 1 instructions
		{
			data: {block:1, left2:category1, right2:category2,blockStart:true},			// we set the data with the category names so the template can display them
			inherit: {set:'instructions', type:'byData', data: {block:'generic'}},			// inherit the generic instruction block
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst1mobile.jst'},
				 location: {left:0,top:0}
			}]
		},
		{
			mixer : 'repeat',
			times: 2,
			data : [
				{inherit : {type:'byData', data:{block:1}, set:'IAT'}} //We inherit from the trialSet 'IAT' that has block equals 1.
			]
		},

		// block 2
		// block 2 instructions
		{
			data: {block:2, left1:attribute1, right1:attribute2, blockStart:true},
			inherit: {set:'instructions', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst2mobile.jst'},
				 location: {left:0,top:0}
			}]
		},
		{
			mixer : 'repeat',
			times: 2,
			data : [
				{inherit : {type:'byData', data:{block:2}, set:'IAT'}}
			]
		},

		// block 3
		// block 3 instructions
		{
			data: {block:3, left1:attribute1, right1:attribute2, left2:category1, right2:category2,blockStart:true},
			inherit: {set:'instructions', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst3mobile.jst'},
				 location: {left:0,top:0}
			}]
		},
		{
			mixer: 'repeat',
			times: 2,
			data: [
				{inherit : {type:'byData', data:{block:3,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:3,row:2}, set:'IAT'}}
			]
		},

		// block 4
		// block 4 instructions
		{
			data: {block:4, left2:category2, right2:category1,blockStart:true},
			inherit: {set:'instructions', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst4mobile.jst'},
				location: {left:0,top:0}

			}]
		},
		{
			mixer : 'repeat',
			times: 2,
			data : [
				{inherit : {type:'byData', data:{block:4}, set:'IAT'}}
			]
		},

		// block 5
		// block 5 instructions
		{
			data: {block:5, left1:attribute1, right1:attribute2, left2:category2, right2:category1,blockStart:true},
			inherit: {set:'instructions', type:'byData', data: {block:'generic'}},
			stimuli: [{
				inherit:'Instructions',
				media:{template:'inst5mobile.jst'},
				location: {left:0,top:0}
			}]
		},
		{
			mixer: 'repeat',
			times: 2,
			data: [
				{inherit : {type:'byData', data:{block:5,row:1}, set:'IAT'}},
				{inherit : {type:'byData', data:{block:5,row:2}, set:'IAT'}}
			]
		},

		{ //Instructions trial, the end of the task, instruction what to do next
			inherit: {set:'instructions', type:'byData', data: {block:'generic'}},
			data : {blockStart:true},
			stimuli: [
				{//The instructions stimulus
					data : {'handle':'instStim'},
					css: {color:'white'},
					media:{html:'<div><p  style="font-size:2em"><color="#FFFFFF">You have completed the IAT. <br/><br/>Touch the green area below to continue.</p></div>'}
				}
			]
		}

	]);

	return API.script;
});

