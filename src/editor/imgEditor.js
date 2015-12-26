export default imgEditor;

let imgEditor = {
	view: (ctrl, args) => {
		let file = args.file;
		return m('div', {
			style:{display:'flex', 'justify-content':'center','align-items':'center'},
			config: (element, isInitialized, ctx) => {

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

			}
		},[
			m('img', {src:file.url})
		]);
	}
};