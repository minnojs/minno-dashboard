import contextMenu from '../../contextMenuComponent';
export default fileContext;


let fileContext = (file, study) => {
	let menu = [
		//{icon:'fa-plus', text:'New File', action: () => study.create('new.js')},
		{icon:'fa-copy', text:'Duplicate', action: () => alert('Duplicate')},
		{separator:true},
		{icon:'fa-download', text:'Download', action: () => {
			alert('download');
			return;
			let link = document.createElement('a');
			link.href = file.url;
			link.download = file.name;
			link.target = '_blank';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}},
		// {icon:'fa-clipboard', text:'Copy Url', action: () => alert('copy')},
		{icon:'fa-close', text:'Delete', action: () => study.del(file.id)}

	];
	return contextMenu.open(menu);
};