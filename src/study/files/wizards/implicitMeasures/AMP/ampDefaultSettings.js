function defaultSettings(external) {
    return {
        parameters: {
            isQualtrics: false,
            exampleBlock: true,
            fixationDuration: 0,
            showRatingDuration: 300,
            responses: 2,
            sortingLabel1: 'Pleasant', //Response is coded as 0.
            sortingLabel2: 'Unpleasant',  //Response is coded as 1.
            randomizeLabelSides: false, //If false, then label1 is on the left, and label2 is on the right.
            rightkey: 'i',
            leftkey: 'e',
            fixationStimulus: { //The fixation stimulus
                css: {color: '#000000', 'font-size': '3em'},
                media: {word: '+'}
            },
            maskStimulus: { //The mask stimulus
                css: {color: '000000', 'font-size': '3em'},
                media: {image: 'ampmask.jpg'}
            },
            base_url: {image: external ? 'https://baranan.github.io/minno-tasks/images/ampImages' : './images'}
        },
        exampleBlock: {
            exampleTargetStimulus:
                {
                    nameForLogging: 'exampleTarget', //Will be used in the logging
                    sameAsTargets: true //Use the same media array as the first targetCat.
                },
            exampleFixationStimulus: { //The fixation stimulus in the example block
                css: {color: '000000', 'font-size': '3em'},
                media: {word: '+'}
            },
            exampleMaskStimulus: { //The mask stimulus in the example block
                css: {color: '000000', 'font-size': '3em'},
                media: {image: 'ampmaskr.jpg'}
            },
            examplePrimeStimulus: {
                nameForLogging: 'examplePrime', //Will be used in the logging
                //An array of all media objects for this category.
                mediaArray: [{word: 'Table'}, {word: 'Chair'}]
            },
            exampleBlock_fixationDuration: -1,
            exampleBlock_primeDuration: 100,
            exampleBlock_postPrimeDuration: 100,
            exampleBlock_targetDuration: 300
        },
        primeStimulusCSS: { //The CSS for all the prime stimuli.
            primeDuration: 100,
            postPrimeDuration: 100,
            color: '#0000FF',
            'font-size': '2.3em'
        },
        //primeCats: [
        prime1: {
            nameForFeedback: 'positive words',  //Will be used in the user feedback
            name: 'positive', //Will be used in the logging
            //An array of all media objects for this category.
            mediaArray: [{word: 'Wonderful'}, {word: 'Great'}]
        },
        prime2:{
            nameForFeedback: 'negative words',  //Will be used in the user feedback
            name: 'negative', //Will be used in the logging
            mediaArray: [{word: 'Awful'}, {word: 'Horrible'}]
        },
        //],
        targetStimulusCSS: { //The CSS for all the target stimuli (usually irrelevant because the targets are Chinese pictographs).
            targetDuration: 100,
            color: '#0000FF',
            'font-size': '2.3em'},
        //targetCats: [
        targetCategory:{
            nameForFeedback : 'Chinese symbol',  //The name of the targets (used in the instructions)
            name: 'chinese',  //Will be used in the logging
            //An array of all media objects for this category. The default is pic1-pic200.jpg
            mediaArray: [
                {image: 'pic1.jpg'}, {image: 'pic2.jpg'}, {image: 'pic3.jpg'}, {image: 'pic4.jpg'}, {image: 'pic5.jpg'}, {image: 'pic6.jpg'}, {image: 'pic7.jpg'}, {image: 'pic8.jpg'}, {image: 'pic9.jpg'},
                {image: 'pic10.jpg'}, {image: 'pic11.jpg'}, {image: 'pic12.jpg'}, {image: 'pic13.jpg'}, {image: 'pic14.jpg'}, {image: 'pic15.jpg'}, {image: 'pic16.jpg'}, {image: 'pic17.jpg'}, {image: 'pic18.jpg'}, {image: 'pic19.jpg'},
                {image: 'pic20.jpg'}, {image: 'pic21.jpg'}, {image: 'pic22.jpg'}, {image: 'pic23.jpg'}, {image: 'pic24.jpg'}, {image: 'pic25.jpg'}, {image: 'pic26.jpg'}, {image: 'pic27.jpg'}, {image: 'pic28.jpg'}, {image: 'pic29.jpg'},
                {image: 'pic30.jpg'}, {image: 'pic31.jpg'}, {image: 'pic32.jpg'}, {image: 'pic33.jpg'}, {image: 'pic34.jpg'}, {image: 'pic35.jpg'}, {image: 'pic36.jpg'}, {image: 'pic37.jpg'}, {image: 'pic38.jpg'}, {image: 'pic39.jpg'},
                {image: 'pic40.jpg'}, {image: 'pic41.jpg'}, {image: 'pic42.jpg'}, {image: 'pic43.jpg'}, {image: 'pic44.jpg'}, {image: 'pic45.jpg'}, {image: 'pic46.jpg'}, {image: 'pic47.jpg'}, {image: 'pic48.jpg'}, {image: 'pic49.jpg'},
                {image: 'pic50.jpg'}, {image: 'pic51.jpg'}, {image: 'pic52.jpg'}, {image: 'pic53.jpg'}, {image: 'pic54.jpg'}, {image: 'pic55.jpg'}, {image: 'pic56.jpg'}, {image: 'pic57.jpg'}, {image: 'pic58.jpg'}, {image: 'pic59.jpg'},
                {image: 'pic60.jpg'}, {image: 'pic61.jpg'}, {image: 'pic62.jpg'}, {image: 'pic63.jpg'}, {image: 'pic64.jpg'}, {image: 'pic65.jpg'}, {image: 'pic66.jpg'}, {image: 'pic67.jpg'}, {image: 'pic68.jpg'}, {image: 'pic69.jpg'},
                {image: 'pic70.jpg'}, {image: 'pic71.jpg'}, {image: 'pic72.jpg'}, {image: 'pic73.jpg'}, {image: 'pic74.jpg'}, {image: 'pic75.jpg'}, {image: 'pic76.jpg'}, {image: 'pic77.jpg'}, {image: 'pic78.jpg'}, {image: 'pic79.jpg'},
                {image: 'pic80.jpg'}, {image: 'pic81.jpg'}, {image: 'pic82.jpg'}, {image: 'pic83.jpg'}, {image: 'pic84.jpg'}, {image: 'pic85.jpg'}, {image: 'pic86.jpg'}, {image: 'pic87.jpg'}, {image: 'pic88.jpg'}, {image: 'pic89.jpg'},
                {image: 'pic90.jpg'}, {image: 'pic91.jpg'}, {image: 'pic92.jpg'}, {image: 'pic93.jpg'}, {image: 'pic94.jpg'}, {image: 'pic95.jpg'}, {image: 'pic96.jpg'}, {image: 'pic97.jpg'}, {image: 'pic98.jpg'}, {image: 'pic99.jpg'},
                {image: 'pic110.jpg'}, {image: 'pic111.jpg'}, {image: 'pic112.jpg'}, {image: 'pic113.jpg'}, {image: 'pic114.jpg'}, {image: 'pic115.jpg'}, {image: 'pic116.jpg'}, {image: 'pic117.jpg'}, {image: 'pic118.jpg'}, {image: 'pic119.jpg'},
                {image: 'pic120.jpg'}, {image: 'pic121.jpg'}, {image: 'pic122.jpg'}, {image: 'pic123.jpg'}, {image: 'pic124.jpg'}, {image: 'pic125.jpg'}, {image: 'pic126.jpg'}, {image: 'pic127.jpg'}, {image: 'pic128.jpg'}, {image: 'pic129.jpg'},
                {image: 'pic130.jpg'}, {image: 'pic131.jpg'}, {image: 'pic132.jpg'}, {image: 'pic133.jpg'}, {image: 'pic134.jpg'}, {image: 'pic135.jpg'}, {image: 'pic136.jpg'}, {image: 'pic137.jpg'}, {image: 'pic138.jpg'}, {image: 'pic139.jpg'},
                {image: 'pic140.jpg'}, {image: 'pic141.jpg'}, {image: 'pic142.jpg'}, {image: 'pic143.jpg'}, {image: 'pic144.jpg'}, {image: 'pic145.jpg'}, {image: 'pic146.jpg'}, {image: 'pic147.jpg'}, {image: 'pic148.jpg'}, {image: 'pic149.jpg'},
                {image: 'pic150.jpg'}, {image: 'pic151.jpg'}, {image: 'pic152.jpg'}, {image: 'pic153.jpg'}, {image: 'pic154.jpg'}, {image: 'pic155.jpg'}, {image: 'pic156.jpg'}, {image: 'pic157.jpg'}, {image: 'pic158.jpg'}, {image: 'pic159.jpg'},
                {image: 'pic160.jpg'}, {image: 'pic161.jpg'}, {image: 'pic162.jpg'}, {image: 'pic163.jpg'}, {image: 'pic164.jpg'}, {image: 'pic165.jpg'}, {image: 'pic166.jpg'}, {image: 'pic167.jpg'}, {image: 'pic168.jpg'}, {image: 'pic169.jpg'},
                {image: 'pic170.jpg'}, {image: 'pic171.jpg'}, {image: 'pic172.jpg'}, {image: 'pic173.jpg'}, {image: 'pic174.jpg'}, {image: 'pic175.jpg'}, {image: 'pic176.jpg'}, {image: 'pic177.jpg'}, {image: 'pic178.jpg'}, {image: 'pic179.jpg'},
                {image: 'pic180.jpg'}, {image: 'pic181.jpg'}, {image: 'pic182.jpg'}, {image: 'pic183.jpg'}, {image: 'pic184.jpg'}, {image: 'pic185.jpg'}, {image: 'pic186.jpg'}, {image: 'pic187.jpg'}, {image: 'pic188.jpg'}, {image: 'pic189.jpg'},
                {image: 'pic190.jpg'}, {image: 'pic191.jpg'}, {image: 'pic192.jpg'}, {image: 'pic193.jpg'}, {image: 'pic194.jpg'}, {image: 'pic195.jpg'}, {image: 'pic196.jpg'}, {image: 'pic197.jpg'}, {image: 'pic198.jpg'}, {image: 'pic199.jpg'},
                {image: 'pic200.jpg'}
            ]
        },
        //],
        blocks: {
            trialsInExample: 3,trialsInBlock: [40, 40, 40]
        },
        text: { //Instructions text for the 2-responses version.
            exampleBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Press the key <B>rightKey</B> if the targetCat is more rightAttribute than average. ' +
                'Hit the <b>leftKey</b> key if it is more leftAttribute than average.<br/><br/>' +
                'The items appear and disappear quickly.  ' +
                'Remember to ignore the item that appears before the targetCat and evaluate only the targetCat.<br/><br/></p>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'When you are ready to try a few practice responses, hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round 1 of nBlocks]</p></div>',
            firstBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                "See how fast it is? Don't worry if you miss some. " +
                'Go with your gut feelings.<br/><br/>' +
                'Concentrate on each targetCat and rate it as more rightAttribute than the average targetCat with the <b>rightKey</b> key, ' +
                'or more leftAttribute than average with the <b>leftKey</b> key.<br/><br/>' +
                'Evaluate each targetCat and not the item that appears before it. ' +
                'Those items are sometimes distracting.<br/><br/>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'Ready? Hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round 2 of nBlocks]</p></div>',
            middleBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Continue to another round of this task. ' +
                'The rules are exactly the same:<br/><br/>' +
                'Concentrate on the targetCat and rate it as more rightAttribute than average with the <b>rightKey</b> key, ' +
                'or more leftAttribute than average with the <b>leftKey</b> key.<br/><br/>' +
                'Evaluate each targetCat and not the item that appears before it. ' +
                'Those items are sometimes distracting. Go with your gut feelings.<br/><br/>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'Ready? Hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round blockNum of nBlocks]</p></div>',
            lastBlockInst: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Ready for the FINAL round? ' +
                'The rules are exactly the same:<br/><br/>' +
                'Concentrate on the targetCat and rate it as more rightAttribute than average with the <b>rightKey</b> key, ' +
                'or more leftAttribute than average with the <b>leftKey</b> key.<br/><br/>' +
                'Evaluate each targetCat and not the item that appears before it. ' +
                'Those items are sometimes distracting. Go with your gut feelings.<br/><br/>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'Ready? Hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round blockNum of nBlocks]</p></div>',
            endText: '<div><p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial"><color="FFFFFF">' +
                'You have completed the task<br/><br/>Press "space" to continue to next task.</p></div>',
        },
        text_seven: { //Instructions text for the 7-responses version.
            exampleBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Rate your feelings toward the targetCats from <i>Extremely negativeAdj</i> to <i>Extremely positiveAdj</i>. ' +
                'The items appear and disappear quickly.  ' +
                'Remember to ignore the item that appears before the targetCat and evaluate only the targetCat.<br/><br/></p>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'When you are ready to try a few practice responses, hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round 1 of nBlocks]</p></div>',
            firstBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                "See how fast it is? Don't worry if you miss some. " +
                'Go with your gut feelings.<br/><br/>' +
                'Concentrate on each targetCat and rate it based on your own feelings. ' +
                'Evaluate each targetCat and not the item that appears before it. ' +
                'Those items are sometimes distracting.<br/><br/>' +
                'Notice: you can respond with your mouse or the keys 1-7.<br/><br/>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'Ready? Hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round 2 of nBlocks]</p></div>',
            middleBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Continue to another round of this task. ' +
                'The rules are exactly the same:<br/><br/>' +
                'Concentrate on each targetCat and rate it based on your own feelings. ' +
                'Evaluate each targetCat and not the item that appears before it. ' +
                'Those items are sometimes distracting.<br/><br/>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'Ready? Hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round blockNum of nBlocks]</p></div>',
            lastBlockInst7: '<div><p style="font-size:20px; text-align:left; margin-left:10px; font-family:arial"><color="000000"><br/>' +
                'Ready for the FINAL round? ' +
                'The rules are exactly the same:<br/><br/>' +
                'Concentrate on each targetCat and rate it based on your own feelings. ' +
                'Evaluate each targetCat and not the item that appears before it. ' +
                'Those items are sometimes distracting.<br/><br/>' +
                '<p style="font-size:16px; text-align:center; font-family:arial"><color="000000"><br/><br/>' +
                'Ready? Hit the <b>space bar</b>.</p>' +
                '<p style="font-size:12px; text-align:center; font-family:arial">' +
                '<color="000000">[Round blockNum of nBlocks]</p></div>',
            endText: '<div><p style="font-size:20px; text-align:left; vertical-align:bottom; margin-left:10px; font-family:arial"><color="FFFFFF">' +
                'You have completed the task<br/><br/>Press "space" to continue to next task.</p></div>',
        }
    };
}
export default defaultSettings;


