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
        return m('.date-range', {config: pikadayRange.config(args)}, [
            m('.figure', [
                m('strong','Start Date'),
                m('br'),
                m('.figure')
            ]),
            m.trust('&nbsp;'),
            m('.figure', [
                m('strong','End Date'),
                m('br'),
                m('.figure')
            ])
        ]);
    },
    config({startDate, endDate}){
        return (element, isInitialized, ctx) => {
            let startPicker = ctx.startPicker;
            let endPicker = ctx.endPicker;

            if (!isInitialized) setup();

            function setup(){
                startPicker = ctx.startPicker = new Pikaday({
                    onSelect: onSelect(startDate)
                });

                endPicker = ctx.endPicker = new Pikaday({
                    onSelect: onSelect(endDate)
                });

                startPicker.setDate(startDate());
                endPicker.setDate(endDate());

                element.children[0].children[2].appendChild(startPicker.el);
                element.children[1].children[2].appendChild(endPicker.el);

                ctx.onunload = () => {
                    startPicker.destroy();
                    endPicker.destroy();
                };
            }

            function onSelect(prop){
                return date => {
                    prop(date); // update start/end

                    startPicker.setDate(startDate(),true);
                    endPicker.setDate(endDate(),true);
                    update();

                    m.redraw();

                    function update(){
                        startPicker.setStartRange(startDate());
                        startPicker.setEndRange(endDate());
                        endPicker.setStartRange(startDate());
                        endPicker.setEndRange(endDate());
                        startPicker.setMaxDate(endDate());
                        endPicker.setMinDate(startDate());
                    }
                };
            }
        };
    }
};
