sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'project1/test/integration/FirstJourney',
		'project1/test/integration/pages/empDetailsList',
		'project1/test/integration/pages/empDetailsObjectPage'
    ],
    function(JourneyRunner, opaJourney, empDetailsList, empDetailsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('project1') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheempDetailsList: empDetailsList,
					onTheempDetailsObjectPage: empDetailsObjectPage
                }
            },
            opaJourney.run
        );
    }
);