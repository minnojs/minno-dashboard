export default fullHeight;
let fullHeight = (element, isInitialized, ctx) => {
	if (!isInitialized){
		onResize();

		window.addEventListener('resize', onResize, true);

		ctx.onunload = function(){
			window.removeEventListener('resize', onResize);
		};

	}

	function onResize(){
		element.style.height = document.documentElement.clientHeight - element.getBoundingClientRect().top + 'px';
	}

};