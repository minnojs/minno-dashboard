
import {showRestrictions} from './utilities.js';

let parametersComponent = {
    controller:controller,
    view:view
};

function controller(taskType, settings, elementName){
    let primeCss = settings[elementName];
    let elementType = m.prop(elementName.includes('target') ? 'Target' : 'Prime');
    let durationFieldName = m.prop(elementType() === 'Target' ? 'targetDuration' : 'primeDuration');
    return {set, get, elementType, durationFieldName, primeCss};

    function get(parameter){
        if (parameter === 'font-size') return parseFloat((primeCss[parameter]).substring(0,3));
        return primeCss[parameter];
    }
    function set(parameter){
        return function(value){
            if(parameter.includes('Duration')) //Duration parameter is under settings directly
                return primeCss[parameter] = Math.abs(value);
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

function view(ctrl, taskType){
    return m('.space' , [
        m('.row.line',[
            m('.col-sm-3',[
                m('.row.space', m('.col-sm-12', m('span', 'Font\'s color:'))),
                m('.row.space', m('.col-sm-6', m('input[type=color].form-control', {value: ctrl.get('color'), onchange:m.withAttr('value', ctrl.set('color'))})))
            ]),
            m('.col-sm-3',[
                m('.row.space', m('.col-sm-12',m('span', 'Font\'s size:'))),
                m('.row.space', m('.col-sm-6',m('input[type=number].form-control', {placeholder:'1', value:ctrl.get('font-size') ,min: '0' ,onchange:m.withAttr('value', ctrl.set('font-size'))})))
            ])
        ]),
        m('.row.space',[
            m('.col-sm-3',[
                m('.row.space', m('.col-sm-12', m('span', ctrl.elementType()+' category\'s display presentation:'))),

                m('.row.space', m('.col-sm-6', m('input[type=number].form-control',{placeholder:'0', min:0, value:ctrl.get(ctrl.durationFieldName()), onchange:m.withAttr('value', ctrl.set(ctrl.durationFieldName()))})))
            ]),
            ctrl.elementType() === 'Prime' && taskType === 'AMP' ?
                m('.col-sm-3',[
                    m('.row.space', m('.col-sm-12', m('span', 'Post prime category\'s display presentation:'))),
                    m('.row.space', m('.col-sm-6', m('input[type=number].form-control',{placeholder:'0', min:0, value:ctrl.get('postPrimeDuration'), onchange:m.withAttr('value', ctrl.set('postPrimeDuration'))})))
                ])
                : ''
        ])
    ]);
}

export default parametersComponent;
