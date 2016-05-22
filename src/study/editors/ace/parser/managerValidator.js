export default function managerValidator(){
    var errors = [];

    errors.push({type:'Settings', errors:[]});
    errors.push({type:'Tasks', errors:[]});

    return errors;
}



