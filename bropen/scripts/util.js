const setScoreForMatchup = async (matchId, blueScore, redScore) => {

	let matchups = db.collection("matchups");

	let matchup = matchups.doc(matchId.toString()).get();

	matchup.then(r => {
		
		let red = r.data()['team']['red'];
		let blue = r.data()['team']['blue'];
		let advantage = r.data()['team']['advantage']
		let ties = r.data()['team']['ties']

		let teamAdv = "Even";
		let teamScore = parseInt(0);

		red.score = parseInt(redScore);
		blue.score = parseInt(blueScore);


		if(red.score > blue.score) {
			teamScore = red.score - blue.score;

			teamAdv = "Red";

			advantage = {
				team: "Red",
				score: teamScore
			}
			
		} else if (red.score < blue.score) {
			teamScore = blue.score - red.score;
			console.log("Blue by " + teamScore);
			teamAdv = "Blue";

			advantage = {
				team: "Blue",
				score: teamScore
			}
			
		} else {
			advantage = {
				team: "Even",
				score: 0
			}
		}

		db.collection("matchups").doc(matchId.toString()).set({
			team: {blue, red, advantage, ties}
		}).then(function() {
		    console.log("Document successfully written!");
			location.reload();
		})

	});

}

const calculateHeadToHeadAdvantage = async (matchId) => {
	let matchups = db.collection("matchups");

	let matchup = matchups.doc(matchId.toString()).get();

	let result = matchup.then(m => {
		red = m.data()['team']['red'].score;
		blue = m.data()['team']['blue'].score;

		if(red == blue) {
			return 'Even';
		} else if (red > blue) {
			return 'White';
		} else {
			return 'Blue'
		}
	})

	result.then(r => console.log(r));

}

const showPage = async(page) => {

	$("#golfers").attr("hidden", true);
	$("#rounds").attr("hidden", true);
	$("#scoreboard").attr("hidden", true);

	if(page=="scoreboard") {
		await loadScoreboard();
		await loadScorecard(1);
	}

	if(page=="rounds") {
		await loadMatchupTable(1);
	}

	$("#" + page).attr("hidden", false);
}