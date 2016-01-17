export default function sortTable(list, sortByProp) {
	return function(e) {
		var prop = e.target.getAttribute('data-sort-by');
		if (prop) {
			if (typeof sortByProp == 'function') sortByProp(prop); // record property so that we can change style accordingly
			var first = list[0];
			list.sort(function(a, b) {
				return a[prop] > b[prop] ? 1 : a[prop] < b[prop] ? -1 : 0;
			});
			if (first === list[0]) list.reverse();
		}
	};
}
