function defaultSettings(external){
    return {
        parameters : {isTouch:false, isQualtrics:false, practiceBlock:true,
            showStimuliWithInst:true, remindError:true,
            base_url: {image: external ? 'https://cdn.jsdelivr.net/gh/baranan/minno-tasks@0.*/docs/images/' : './images'}
        },
        blocks: {nMiniBlocks: 1, nTrialsPerMiniBlock:16, nPracticeBlockTrials: 8, nCategoryAttributeBlocks: 4,
            focalAttribute: 'attribute1', firstFocalAttribute : 'random', focalCategoryOrder: 'random'
        },
        practiceCategory1 : {
            name : 'Mammals',
            title : {
                media : {word : 'Mammals'},
                css : {color:'#31b404','font-size':'1.8em'},
                height : 4,
                startStimulus : {
                    media : {word : 'Dogs, Horses, Cows, Lions'},
                    css : {color:'#31b404','font-size':'1em'},
                    height : 2
                }
            },
            stimulusMedia : [
                {word : 'Dogs'},
                {word : 'Horses'},
                {word : 'Lions'},
                {word : 'Cows'}
            ],
            stimulusCss : {color:'#31b404','font-size':'2em'}},
        practiceCategory2 : {
            name : 'Birds',
            title : {
                media : {word : 'Birds'},
                css : {color:'#31b404','font-size':'1.8em'},
                height : 4,
                startStimulus : {
                    media : {word : 'Pigeons, Swans, Crows, Ravens'},
                    css : {color:'#31b404','font-size':'1em'},
                    height : 2
                }
            },
            stimulusMedia : [
                {word : 'Pigeons'},
                {word : 'Swans'},
                {word : 'Crows'},
                {word : 'Ravens'}
            ],
            stimulusCss : {color:'#31b404','font-size':'2em'}
        },
        categories : [  //As many categories you need.
            {
                name : 'Black people',
                title : {
                    media : {word : 'Black people'},
                    css : {color:'#31b404','font-size':'1.8em'},
                    height : 4,
                    startStimulus : {
                        media : {word : 'Tyron, Malik, Terrell, Jazmin, Tiara, Shanice'},
                        css : {color:'#31b404','font-size':'1em'},
                        height : 2
                    }
                },
                stimulusMedia : [
                    {word: 'Tyron'},
                    {word: 'Malik'},
                    {word: 'Terrell'},
                    {word: 'Jazmin'},
                    {word: 'Tiara'},
                    {word: 'Shanice'}
                ],
                stimulusCss : {color:'#31b404','font-size':'2em'}
            },
            {
                name : 'White people',
                title : {
                    media : {word : 'White people'},
                    css : {color:'#31b404','font-size':'1.8em'},
                    height : 4,
                    startStimulus : {
                        media : {word : 'Jake, Connor, Bradley, Alison, Emma, Emily'},
                        css : {color:'#31b404','font-size':'1em'},
                        height : 2
                    }
                },
                stimulusMedia : [
                    {word: 'Jake'},
                    {word: 'Connor'},
                    {word: 'Bradley'},
                    {word: 'Allison'},
                    {word: 'Emma'},
                    {word: 'Emily'}
                ],
                //Stimulus css
                stimulusCss : {color:'#31b404','font-size':'2em'}
            }
        ],
        attribute1 :
            {
                name : 'Pleasant',
                title : {
                    media : {word : 'Pleasant'},
                    css : {color:'#0000FF','font-size':'1.8em'},
                    height : 4,
                    startStimulus : {
                        media : {word : 'Joy, Love, Happy, Good'},
                        css : {color:'#0000FF','font-size':'1em'},
                        height : 2
                    }
                },
                stimulusMedia : [
                    {word : 'Joy'},
                    {word : 'Love'},
                    {word : 'Happy'},
                    {word : 'Good'}
                ],
                stimulusCss : {color:'#0000FF','font-size':'2em'}
            },
        attribute2 :
            {
                name : 'Unpleasant',
                title : {
                    media : {word : 'Unpleasant'},
                    css : {color:'#0000FF','font-size':'1.8em'},
                    height : 4,
                    startStimulus : {
                        media : {word : 'Horrible, Evil, Nasty, Bad'},
                        css : {color:'#0000FF','font-size':'1em'},
                        height : 2
                    }
                },
                stimulusMedia : [
                    {word : 'Horrible'},
                    {word : 'Nasty'},
                    {word : 'Bad'},
                    {word : 'Evil'}
                ],
                stimulusCss : {color:'#0000FF','font-size':'2em'}
            },
        text: {
            leftKeyText:'"E" for all else',
            rightKeyText:'"I" if item belongs',
            orText:'or',
            remindErrorText : '<p style="font-size:0.6em;font-family:arial sans-serif; text-align:center;">' +
                'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                'Press the other key to continue.<p/>',
            finalText : 'Press space to continue to the next task',
            instTemplate: '<div><p style="font-size:20px; font-family:arial sans-serif; text-align:center;"><br/>' +
                '<font-color="#000000"><u>Part blockNum of nBlocks </u><br/><br/></p>' +
                '<p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial">' +
                'Put a right finger on the <b>I</b> key for items that belong to the category ' +
                '<font-color="#0000FF">focalAtt</font>, ' +
                'and for items that belong to the category <font-color="#31b404">focalCat</font>.<br/>' +
                'Put a left finger on the <b>E</b> key for items that do not belong to these categories.<br/><br/>' +
                'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                'Press the other key to continue.<br/><br/>' +
                '<p style="text-align:center;">Press the <b>space bar</b> when you are ready to start.</font></p></div>',
        },
        touch_text : {
            rightKeyTextTouch : 'Left for all else',
            leftKeyTextTouch : 'Right if item belongs',
            remindErrorTextTouch : '<p style="font-size:1.4em; font-family:arial sans-serif; text-align:center;">' +
                'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                'Touch the other side to continue.<p/>',
            finalTouchText: 'Touch the bottom green area to continue to the next task',
            instTemplateTouch: '<div><p style="text-align:center;"" ' +
                '<br/><font-color="#000000"><u>Part blockNum of nBlocks </u><br/></p>' +
                '<p style="text-align:left;" style="margin-left:5px"> ' +
                'Put a right finger on the <b>right</b> green area for items that belong to the category ' +
                '<font-color="#0000FF">focalAtt</font>, ' +
                'and for items that belong to the category <font-color="#31b404">focalCat</font>.<br/>' +
                'Put a left finger on the <b>left</b> green area for items that do not belong to these categories.<br/>' +
                'If you make a mistake, a red <font-color="#ff0000"><b>X</b></font> will appear. ' +
                'Press the other key to continue.<br/>' +
                '<p style="text-align:center;">Touch the <b>lower </b> green area to start.</font></p></div>',

        }
    };
}

export default defaultSettings;
