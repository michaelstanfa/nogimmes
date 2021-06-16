const loadScoreboard = async () => {
    let rounds = await roundsData;

    let blueTotalPoints = 0;
    let redTotalPoints = 0;

    await rounds.forEach(async (r) => {
    
        
        let redRoundPoints = 0;
        let blueRoundPoints = 0;
        
        let matchups = await db.collection('rounds').doc(r.id).collection('matchups').get();
        await matchups.forEach(async (m) => {
            let matchup = await m;
            console.log(matchup.data().scoreboard);
            
            redRoundPoints += matchup.data().scoreboard.redPoints;
            blueRoundPoints += matchup.data().scoreboard.bluePoints;
        })

        $("#red_round_" + r.id + "_points").html(redRoundPoints);
        $("#blue_round_" + r.id + "_points").html(blueRoundPoints);

        redTotalPoints += redRoundPoints;
        blueTotalPoints += blueRoundPoints;

        $("#blue_total_points").html(blueTotalPoints);
        $("#red_total_points").html(redTotalPoints);

    });


	
}