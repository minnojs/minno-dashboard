// import $ from 'jquery';
let Pikaday = window.Pikaday;

export let datePicker = (prop, options) => m.component(pikaday, {prop,options});
export let dateRangePicker = args => m.component(pikadayRange, args);

let pikaday = {
    view(ctrl, {prop, options}){
        return m('div', {config: pikaday.config(prop, options)});
    },
    config(prop, options){
        return (element, isInitialized, ctx) => {
            if (!isInitialized){
                ctx.picker = new Pikaday(Object.assign({
                    onSelect: prop,
                    container: element
                },options));

                element.appendChild(ctx.picker.el);
            }

            ctx.picker.setDate(prop());
        };
    }
};

/**
 * args = {
 *  startValue: m.prop,
 *  endValue: m.prop,
 *  options: Object // specific daterange plugin options
 * }
 */

let pikadayRange = {
    view: function(ctrl, args){
        return m('.row.form-group.date-range', {config: pikadayRange.config(args)}, [
            m('.col-sm-6', [
                m('label','Start Date'),
                m('label.input-group',[
                    m('.input-group-addon', m('i.fa.fa-fw.fa-calendar')),
                    m('input.form-control')
                ])
            ]),
            m('.col-sm-6', [
                m('label','End Date'),
                m('label.input-group',[
                    m('.input-group-addon', m('i.fa.fa-fw.fa-calendar')),
                    m('input.form-control')
                ])
            ])
        ]);
    },
    config({startDate, endDate}){
        return (element, isInitialized, ctx) => {
            let startPicker = ctx.startPicker;
            let endPicker = ctx.endPicker;

            if (!isInitialized) setup();

            // external date change
            if (!areDatesEqual(startDate, startPicker) || !areDatesEqual(endDate, endPicker)) update(); 

            function setup(){
                let startElement = element.children[0].children[1].children[1];
                startPicker = ctx.startPicker = new Pikaday({
                    onSelect: onSelect(startDate),
                    field: startElement 
                });
                startElement.addEventListener('keyup', onKeydown(startPicker));
                
                let endElement = element.children[1].children[1].children[1];
                endPicker = ctx.endPicker = new Pikaday({
                    onSelect: onSelect(endDate),
                    field: endElement
                });
                endElement.addEventListener('keyup', onKeydown(endPicker));

                startPicker.setDate(startDate());
                endPicker.setDate(endDate());

                ctx.onunload = () => {
                    startPicker.destroy();
                    endPicker.destroy();
                };
            }

            function onKeydown(picker){
                return e => e.keyCode === 13 && picker.isVisible() && e.stopPropagation();
            }

            function onSelect(prop){
                return date => {
                    prop(date); // update start/end

                    update();
                    m.redraw();
                };
            }

            function update(){
                startPicker.setDate(startDate(),true);
                endPicker.setDate(endDate(),true);

                startPicker.setStartRange(startDate());
                startPicker.setEndRange(endDate());
                endPicker.setStartRange(startDate());
                endPicker.setEndRange(endDate());
                startPicker.setMaxDate(endDate());
                endPicker.setMinDate(startDate());
            }

            function areDatesEqual(prop, picker){
                return prop().getTime() === picker.getDate().getTime();
            }
        };
    }
};
