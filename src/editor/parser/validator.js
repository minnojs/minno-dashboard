import pipValidate from './pipValidator';
import questValidate from './questValidator';
import managerValidate from './managerValidator';

export default function validate(script){
	var type = script.type && script.type.toLowerCase();
	switch (type){
	case 'pip' : return pipValidate.apply(null, arguments);
	case 'quest' : return questValidate.apply(null, arguments);
	case 'manager' : return managerValidate.apply(null, arguments);
	default:
		throw new Error('Unknown script.type: ' + type);
	}
}

export function dd(){
	return [
		{
			type: 'task',
			errosrs:[],
			errors: [
				{
					element: {name:'myName', content: [1,2,3]},
					messages: [
						{level:'error', message: 'error message1'},
						{level:'warn', message: 'warn message2'},
						{level:'warn', message: 'warn message3'},
						{level:'error', message: 'error message4'}
					]
				},
				{
					element: {name:'otherName', content: [1,2,3]},
					messages: [
						{level:'warn', message: 'warn message1'},
						{level:'error', message: 'error message2'}
					]
				}
			]
		}

	];
}
