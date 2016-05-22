export default function questValidator(){
    var errors = [];

    errors.push({type:'Settings', errors:[]});
    errors.push({type:'Pages', errors:[]});
    errors.push({type:'Questions', errors:[]});

    return errors;
}
