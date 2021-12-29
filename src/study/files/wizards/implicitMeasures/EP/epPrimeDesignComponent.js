
import {showRestrictions} from '../resources/utilities.js';

let parametersComponent = {
    controller:controller,
    view:view
};

function controller(settings){
    let primeCss = settings.primeStimulusCSS;
    return {set, get};

    function get(parameter){
        if (parameter === 'font-size') return parseFloat((primeCss[parameter]).substring(0,3));
        return primeCss[parameter];
    }
    function set(parameter){
        return function(value){
            if (parameter === 'font-size'){
                value = Math.abs(value);
                if (value === 0){
                    showRestrictions('Font\'s size must be bigger than 0.', 'error');
                    return primeCss[parameter];
                }
                return primeCss[parameter] = value + 'em';
            }
            return primeCss[parameter] = value;
        };
    }
}

function view(ctrl){
    return m('.row' , [
        m('.col-sm-12',[
            m('.row.space',[
                m('.col-sm-2',[
                    m('span', 'Font\'s color: '),
                    m('input[type=color].form-control', {value: ctrl.get('color'), onchange:m.withAttr('value', ctrl.set('color'))})
                ]),
                m('.col-sm-2',[
                    m('span', 'Font\'s size: '),
                    m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('font-size'))})
                ])
            ])
        ])
    ]);
}

export default parametersComponent;
