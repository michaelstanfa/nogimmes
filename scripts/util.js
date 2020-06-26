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

const setScoreForMatchup = async (matchId, team, newScore) => {

	let matchups = db.collection("matchups");

	let matchup = matchups.doc(matchId.toString()).get();

	matchup.then(r => {
		console.log(r);	
		console.log(r.data());
		let updateTeam = r.data()['team'][team];
		updateTeam.score = parseInt(newScore);
		if(team=='blue') {
			blue = updateTeam;
			red = r.data()['team']['red'];
		} else {
			red = updateTeam;
			blue = r.data()['team']['blue'];
		}

		console.log(red);
		console.log(blue);
		console.log(updateTeam);
		
		db.collection("matchups").doc(matchId.toString()).set({
			team: {blue, red}
		})

	});

}