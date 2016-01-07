import layoutWrapper from './layoutWrapper';
import studiesComponent from './study/studiesComponent';
import studyComponent from './study/studyComponent';
import poolComponent from './pool/poolComponent';

/**
 * Map Object
 * A utility function to transform objects
 * @param  {Object} 	obj 	The object to transform
 * @param  {Function} 	cb 		The transforming function
 * @return {Object}        [description]
 *
 * Signature:
 *
 * Object mapObject(Object obj, callbackFunction cb)
 *
 * where:
 * 	callbackFunction :: any Function(any value, String key, Object object)
 */
let mapObject = (obj, cb) => Object.keys(obj).reduce(function(result, key) {
	result[key] = cb(obj[key], key, obj);
	return result;
}, {});

let routes = {
	'studies' : studiesComponent,
	'/editor/:studyID': studyComponent,
	'/editor/:studyID/:fileID': studyComponent,
	'/pool': poolComponent
};



let wrappedRoutes = mapObject(routes, layoutWrapper);
m.route(document.body, 'studies', wrappedRoutes);

