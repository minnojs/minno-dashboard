import classNames from './classNames';
export default contextMenuComponent;

let contextMenuComponent = {
	show: m.prop(false),
	style: m.prop({}),
	menu: m.prop([
		{icon:'fa-play', text:'begone'},
		{icon:'fa-play', text:'asdf'},
		{separator:true},
		{icon:'fa-play', text:'wertwert', menu: [
			{icon:'fa-play', text:'asdf'}
		]}
	]),

	view: (ctrl) => {
		return m(
			'.context-menu',
			{
				class: classNames({'show-context-menu': contextMenuComponent.show()}),
				style: contextMenuComponent.style(),
				onclick: e => e.stopPropagation()
			},
			contextMenuComponent.menu().map(menuNode)
		);
	},

	trigger: e => {
		e.preventDefault();
		contextMenuComponent.show(true);
		contextMenuComponent.style({
			left:e.pageX + 'px',
			top:e.pageY + 'px'
		});

		document.addEventListener('click', onClick, false);
		function onClick(){
			contextMenuComponent.show(false);
			document.removeEventListener('click', onClick);
		}
	}
};

let menuNode = node => {
	return node.separator
		? m('.context-menu-separator')
		: m('.context-menu-item', {class: classNames({disabled: node.disabled, submenu:node.menu})}, [
			m('button.context-menu-btn',{onclick:node.action}, [
				m('i.fa', {class:node.icon}),
				m('span.context-menu-text', node.text)
			]),
			node.menu ? m('.context-menu', node.menu.map(menuNode)) : ''
		]);
};




// var menu = document.querySelector('.menu');

// function showMenu(x, y){
//     menu.style.left = x + 'px';
//     menu.style.top = y + 'px';
//     menu.classList.add('show-menu');
// }

// function hideMenu(){
//     menu.classList.remove('show-menu');
// }

// function onContextMenu(e){
//     e.preventDefault();
//     showMenu(e.pageX, e.pageY);
//     document.addEventListener('click', onClick, false);
// }

// function onClick(e){
//     hideMenu();
//     document.removeEventListener('click', onClick);
// }

// document.addEventListener('contextmenu', onContextMenu, false);
