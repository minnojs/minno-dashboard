import {warn, error, row} from './messages';
import {pipElements} from './parser';

export default pipValidator;

function pipValidator(script, url){
	var errors = [];
	var elements = pipElements(script);

	errors.push({type:'Settings',errors: checkSettings(script, url)});
	errors.push({type:'Trials',errors: filterMap(elements.trials, trialTest)});
	// errors.push({type:'Stimuli',errors: filterMap(elements.stimuli, stimuliTest)});
	// errors.push({type:'Media',errors: filterMap(elements.media, mediaTest)});

	return errors;
}

function filterMap(arr, fn){
	return arr.map(fn).filter(e=>e);
}

/**
 * Check settings
 * @param  {Object} script The script to be tested
 * @param  {String} url    The script origin URL
 * @return {Array}        Array of error rows
 */
function checkSettings(script, url){
	var settings = script.settings || {};

	var w = byProp(warn);
	// var e = byProp(error);

	var errors = [
		r('base_url', [
			w('Your base_url is not in the same directory as your script.', e => {
				// use this!!!
				// http://stackoverflow.com/questions/4497531/javascript-get-url-path
				var getPath = url => {
					var a = document.createElement('a');
					a.href = url;
					return a.pathname;
				};

				var path = getPath(url).substring(0, url.lastIndexOf('/') + 1); // get path but remove file name
				var t = s => (!s || getPath(s).indexOf(path) !== 0);

				return (typeof e == 'object') ? t(e.image) && t(e.template) : t(e);
			})
		])
	];

	return errors.filter(function(err){return !!err;});

	function r(prop, arr){
		var el = {};
		el[prop] = settings[prop];
		return prop in settings && row(el, arr);
	}

	// wrap warn/error so that I don't have to individually
	function byProp(fn){
		return function(msg, test){
			return fn(msg, e => {
				for (var prop in e) {
					return test(e[prop]);
				}
			});
		};
	}
}

function trialTest(trial) {
	var tests = [
		testInteractions(trial.interactions),
		testInput(trial.input)
	];

	return row(trial, tests);

	function testInteractions(interactions){
		if (!interactions) {return;}

		if (!Array.isArray(interactions)){
			return [error('Interactions must be an array.', true)];
		}

		return [
			interactions.some(i=>!i.conditions) ? error('All interactions must have conditions', true) : [
				error('All conditions must have a type', interactions.some(i=>!!i.conditions.type))
			],
			interactions.some(i=>!i.actions) ? error('All interactions must have actions', true) : [
				error('All actions must have a type', interactions.some(i=>!!i.actions.type))
			]
		];
	}

	function testInput(input){
		if (!input) {return;}

		if (!Array.isArray(trial.input)){
			return [error('Input must be an Array', true)];
		}

		return [
			error('Input must always have a handle', input.some(i=>!i.handle)),
			error('Input must always have an on attribute', input.some(i=>!i.on))
		];
	}
}

function stimuliTest(stim){
	var tests = [];
	return row(stim, tests);
}

function mediaTest(media){
	var tests = [

	];
	return row(media, tests);
}