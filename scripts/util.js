const getThisYearLinesFromFirebase = async () => {
//gotta check to see if the lines for this week have been loaded yet
	let fs = firebase.firestore();
	
	let lines = fs.collection('lines');//('lines/201920/week/1/game/51461/away_team/line');
	
	let year = lines.doc('201920');

	return new Promise(function(resolve, reject) {
		resolve(year.get().then(doc => doc.data()));
	});

}

const getThisWeekLines = async (week) => {

	let fs = firebase.firestore();
	
	let lines = fs.collection('lines');//('lines/201920/week/1/game/51461/away_team/line');
	
	let year = lines.doc('201920');

	let weekLines = lines.doc('201920').collection('week');
	
	return new Promise(function(resolve, reject) {
		resolve(year.collection('week').doc(week.toString()).get().then(doc => doc.data()));
	})
}

const setScoreForMatchup = async (matchId, blueScore, redScore) => {

	let matchups = db.collection("matchups");

	let matchup = matchups.doc(matchId.toString()).get();

	matchup.then(r => {
		
		let red = r.data()['team']['red'];
		let blue = r.data()['team']['blue'];
		let advantage = r.data()['team']['advantage']

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
			team: {blue, red, advantage}
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
			return 'Red';
		} else {
			return 'Blue'
		}
	})

	result.then(r => console.log(r));

}