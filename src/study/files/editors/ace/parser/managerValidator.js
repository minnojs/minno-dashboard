export default function managerValidator(){
    let errors = [];

    errors.push({type:'Settings', errors:[]});
    errors.push({type:'Tasks', errors:[]});

    return errors;
}



