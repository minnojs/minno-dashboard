import routes from './routes';
import layoutWrapper from './layoutWrapper';

let wrappedRoutes = mapObject(routes, layoutWrapper);
m.route(document.body, 'studies', wrappedRoutes);

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
function mapObject(obj, cb) {
	return Object.keys(obj)
		.reduce(function(result, key) {
			result[key] = cb(obj[key], key, obj);
			return result;
		}, {});
}
