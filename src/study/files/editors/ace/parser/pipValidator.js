import {warn, error, row} from './messages';
import {pipElements} from './parser';

export default pipValidator;

function pipValidator(script, url){
    var errors = [];
    var elements = pipElements(script);

    errors.push({type:'Settings',errors: checkSettings(script, url)});
    errors.push({type:'Trials',errors: filterMap(elements.trials, trialTest)});
    // errors.push({type:'Stimuli',errors: filterMap(elements.stimuli, stimuliTest)});
    // errors.push({type:'Media',errors: filterMap(elements.media, mediaTest)});

    return errors;
}

function filterMap(arr, fn){
    return arr.map(fn).filter(e=>e);
}

/**
 * Check settings
 * @param  {Object} script The script to be tested
 * @param  {String} url    The script origin URL
 * @return {Array}        Array of error rows
 */
function checkSettings(script, url){
    var settings = script.settings || {};

    var w = byProp(warn);
    // var e = byProp(error);

    var errors = [
        r('base_url', [
            w('Your base_url is not in the same directory as your script.', e => {
                // use this!!!
                // http://stackoverflow.com/questions/4497531/javascript-get-url-path
                var getPath = url => {
                    var a = document.createElement('a');
                    a.href = url;
                    return a.pathname;
                };

                var path = getPath(url).substring(0, url.lastIndexOf('/') + 1); // get path but remove file name
                var t = s => (!s || getPath(s).indexOf(path) !== 0);

                return (typeof e == 'object') ? t(e.image) && t(e.template) : t(e);
            })
        ])
    ];

    return errors.filter(function(err){return !!err;});

    function r(prop, arr){
        var el = {};
        el[prop] = settings[prop];
        return prop in settings && row(el, arr);
    }

    // wrap warn/error so that I don't have to individually
    function byProp(fn){
        return function(msg, test){
            return fn(msg, e => {
                for (var prop in e) {
                    return test(e[prop]);
                }
            });
        };
    }
}

function trialTest(trial) {
    var tests = [
        testInteractions(trial.interactions),
        testInput(trial.input)
    ];

    return row(trial, tests);

    function testInteractions(interactions){
        if (!interactions) {return;}

        if (!Array.isArray(interactions)){
            return [error('Interactions must be an array.', true)];
        }

        return  interactions.map((interaction, index) => {
            return [
                !interaction.conditions ? error(`Interaction [${index}] must have conditions`, true) : [
                    error(`Interaction conditon [${index}] must have a type`, toArray(interaction.conditions).some(c=>!c.type))
                ],
                !interaction.actions ? error(`Interaction [${index}] must have actions`, true) : [
                    error(`Interaction action [${index}] must have a type`, toArray(interaction.actions).some(a=>!a.type))
                ]
            ];
        });


        function toArray(arr){
            return Array.isArray(arr) ? arr : [arr];
        }

    }

    function testInput(input){
        if (!input) {return;}

        if (!Array.isArray(trial.input)){
            return [error('Input must be an Array', true)];
        }

        return [
            error('Input must always have a handle', input.some(i=>!i.handle)),
            error('Input must always have an on attribute', input.some(i=>!i.on))
        ];
    }
}
