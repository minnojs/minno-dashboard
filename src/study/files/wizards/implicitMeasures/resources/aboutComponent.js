
let links = {IAT: 'https://minnojs.github.io/minnojs-blog/qualtrics-iat/',
	BIAT: 'https://minnojs.github.io/minnojs-blog/qualtrics-biat/',
	STIAT: 'https://minnojs.github.io/minnojs-blog/qualtrics-stiat/',
	SPF: '#',
	EP: 'https://minnojs.github.io/minnojs-blog/qualtrics-priming/'
};

let aboutComponent = {
	view: function(ctrl, settings, defaultSettings, type){
		let extension = '.'+type.toLowerCase();
		return m('.space',
			m('.alert.alert-info',
				!settings.external ? //only show this text if we are in the dashboard
				['This feature of the dashboard will create a script that uses Project Implicit\'s '+type+' extension. ' +
					'After you save your work here, it will be updated into a file with the same name but a different file extension (.js instead of '+extension+'). ' +
					'You can edit that .js file further. However, note that every time you make (and save) changes to the .'+type.toLowerCase()+' file (this wizard),  these changes override your .js file. '
				]:
				['This tool creates a script for running an '+type+' in your online study. ' +
					'The script uses Project Implicit’s '+type+ ' extension, which runs on MinnoJS, a JavaScript player for online studies. ',
					m('a',{href: 'http://projectimplicit.net/'}, 'Project Implicit '), 'has developed MinnoJS to program web studies. ' +
					'To create ' +type+'s, we programmed a general script (the “extension”) that runs an '+type+ ' based on parameters provided by another, ' + 'more simple script. ' +
					'In this page, you can create a script that uses our '+type+' extension. ' +
					'You can read more about the basic idea of using extensions in Minno ',
					m('a',{href: 'https://github.com/baranan/minno-tasks/blob/master/implicitmeasures.md'}, 'on this page. '),
					'We run those scripts in ', m('a',{href: 'https://minnojs.github.io/docsite/minnosuitedashboard/'}, 'Open Minno Suite, '),
					'our platform for running web studies. ' +
					'You can install that platform on your own server, use a more simple ',
					m('a',{href: 'https://minnojs.github.io/minnojs-blog/csv-server/'}, 'php server for Minno, '), 'or run ', m('a',{href: links[type]},'this script directly from Qualtrics.')
				]));}
};

export default aboutComponent;
