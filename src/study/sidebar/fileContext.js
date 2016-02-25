import contextMenu from 'utils/contextMenuComponent';
import messages from 'utils/messagesComponent';
import {moveFile} from './filesActions';
export default fileContext;

// download support according to modernizer
let downloadSupport = !window.externalHost && 'download' in document.createElement('a');

let fileContext = (file, study) => {
	let menu = [
		// {icon:'fa-copy', text:'Duplicate', action: () => messages.alert({header:'Duplicate: ' + file.name, content:'Duplicate has not been implemented yet'})},
		// {separator:true},
		{icon:'fa-download', text:'Download', action: downloadFile},

		// {icon:'fa-clipboard', text:'Copy Url', action: () => alert('copy')},
		{icon:'fa-close', text:'Delete', action: deleteFile},
		{text:'Move/Rename...', action: moveFile(file,study)}
	];

	return contextMenu.open(menu);

	function downloadFile(){
		if (downloadSupport){
			let link = document.createElement('a');
			link.href = file.url;
			link.download = file.name;
			link.target = '_blank';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} else {
			let win = window.open(file.url, '_blank');
			win.focus();
		}
	}

	function deleteFile(){
		messages.confirm({
			header:['Delete ',m('small', file.name)],
			content: 'Are you sure you want to delete this file? This action is permanent!'
		})
		.then(ok => {
			if (ok) return study.del(file.id);
		})
		.then(m.redraw)
		.catch( err => {
			err.response.json()
				.then(response => {
					messages.alert({
						header: 'Delete failed:',
						content: response.message
					});
				});
			return err;
		});
	} // end delete file
};

