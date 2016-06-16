import {fetchText} from 'utils/modelHelpers';

const STATISTICS_URL = '/implicit/PITracking';

export let getStatistics = query => {
    return fetchText(STATISTICS_URL, {method:'post', body: parseQuery(query)})
        .then(response => {
            let csv = CSVToArray(response);
            return {
                study: query.study(),
                file: response,
                headers: csv.shift(),
                data: csv,
                query: Object.assign(query) // clone the query so that we can get back to it in the future
            };
        });

    /**
     * Parses the query as we build it locally and creates an appropriate post for the server
     **/
    function parseQuery({source, study, task, sortstudy, sorttask, sortgroup, sorttime, showEmpty}){
        let baseUrl = `${location.origin}/implicit`;
        let post = {
            db: source().match(/^(.*?):/)[1], // before colon
            current: source().match(/:(.*?)$/)[1], // after colon
            testDB:'newwarehouse',
            study: study(),
            task: task(),
            since:'5/01/2016',
            until:'6/2/2016',
            refresh:'no',
            endTask:'',
            filter:'',
            studyc:sortstudy(),
            taskc:sorttask(),
            datac:sortgroup(),
            timec:sorttime() !== 'None',
            dayc:sorttime() === 'Days',
            weekc:sorttime() === 'Weeks',
            monthc:sorttime() === 'Months',
            yearc:sorttime() === 'Years',
            method:'3',
            cpath:'',
            hpath:'',
            tasksM:'3',
            threads:'yes',
            threadsNum:'1',
            zero: showEmpty(),
            curl:`${baseUrl}/research/library/randomStudiesConfig/RandomStudiesConfig.xml`,
            hurl:`${baseUrl}/research/library/randomStudiesConfig/HistoryRand.xml`,
            baseURL:baseUrl
        };
        return post;
    } 
};


/* eslint-disable */

// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;


    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){

        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
            strMatchedDelimiter !== strDelimiter
            ){

            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );

        }

        var strMatchedValue;

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){

            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
                );

        } else {

            // We found a non-quoted value.
            strMatchedValue = arrMatches[ 3 ];

        }


        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }

    // Return the parsed data.
    return( arrData );
}
/* eslint-enable */
