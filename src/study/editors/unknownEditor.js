export default unknownComponent;

let unknownComponent = {
	view(){
		return m('.centrify', [
			m('i.fa.fa-file.fa-5x'),
			m('h5', 'Unknow file type')
		]);
	}
};