import textInputComponent from './textInput';
import transformProp from 'utils/transformProp';
export default arrayInput;

let arrayInput = args => {
    let identity = arg => arg;
    let fixedArgs = Object.assign(args);
    fixedArgs.prop = transformProp({
        prop: args.prop,
        output: arr => arr.map(args.fromArr || identity).join('\n'),
        input: str => str === '' ? [] : str.replace(/\n*$/, '').split('\n').map(args.toArr || identity)
    });

    return m.component(textInputComponent, fixedArgs);
};

