import messages from './messages';
import {questElements} from './parser';

export default function questValidator(script){
    var errors = [];

    errors.push({type:'Settings', errors:[]});
    errors.push({type:'Pages', errors:[]});
    errors.push({type:'Questions', errors:[]});

    return errors;
}