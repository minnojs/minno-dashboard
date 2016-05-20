
import {warn, error} from './messages';
import {managerElements} from './parser';

export default function managerValidator(script){
    var errors = [];
    var elements = managerElements(script);

    errors.push({type:'Settings', errors:[]});
    errors.push({type:'Tasks', errors:[]});

    return errors;
}



