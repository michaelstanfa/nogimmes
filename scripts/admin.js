let schedule = null;

function Pair(team, playerOne, playerTwo) {
	this.team = team;
	this.playerOne = playerOne;
	this.playerTwo = playerTwo;
}

function HeadToHead(id, pairOne, pairTwo) {
	this.id = id;
	this.pairOne = pairOne;
	this.pairTwo = pairTwo;
}

function Schedule(fullgameschedule) {
	this.fullgameschedule = fullgameschedule;
}

function Week(week, games) {
	this.week = week,
	this.games = games;
}

function Game(id, awayTeam, homeTeam, date, time, awayLine, homeLine) {
	this.id = id,
	this.awayTeam = awayTeam,
	this.homeTeam = homeTeam,
	this.date = date,
	this.time = time,
	this.awayLine = awayLine,
	this.homeLine = homeLine;
}

function Pick(team, against, line) {
	this.team = team,
	this.against = against,
	this.line = line;
}

const retrieveMatchups = async () => {
	return new Promise(async function(resolve, reject){
		resolve(setupAllMatchups());
	})
}

const populateAdminSchedule = async () => {

	let header = "<table class = 'table'><tr><th>#</th><th>Blue Team</th><th>Red Team</th></tr>";

	let body = "";

	let matchups = await retrieveMatchups();
	console.log(matchups.length);
	i = 0;
	matchups[matchups.length - 1].then(matchupArr => {
		matchupArr.forEach(matchup => {
			i++;
			console.log(matchup);
			let team = matchup['team'];
			body += "<tr>"
			body += "<td>" + i + "</td>";
			body += "<td>" + team.blue.member1.name + " & " + team.blue.member2.name + "</td>";
			body += "<td>" + team.red.member1.name + " & " + team.red.member2.name + "</td>";
			body += "</tr>";	
		});
		adminMatchupHTML = header + body + "</table>"
		$("#current_matchups").html(adminMatchupHTML);
	})	

}

const addNewMatchup = async () => {
	console.log($("#new_blue_player_1").val());
	console.log($("#new_blue_player_2").val());
	console.log($("#new_red_player_1").val());
	console.log($("#new_red_player_2").val());

	let blue1 = $("#new_blue_player_1").val()
	let blue2 = $("#new_blue_player_2").val()
	let red1 = $("#new_red_player_1").val();
	let red2 = $("#new_red_player_2").val();

	let index = await db.collection("matchups").get().then(snap => {
		return snap.size + 1;
	});

	if(checkInput(blue1) || checkInput(blue2) || checkInput(red1) || checkInput(red2)) {
		window.alert("Please enter a value for each person");
	} else {

		let blue = {
				member1: {"name" : blue1},
				member2: {"name" : blue2},
				score: 0
			}
		let red = {
				member1: {"name" : red1},
				member2: {"name" : red2},
				score: 0
			}

		db.collection("matchups").doc(index.toString()).set({
			team: {blue, red}
		})

		.then(function() {
		    console.log("Document successfully written!");
			location.reload();
		})

		clearInput($("#new_blue_player_1"));		
		clearInput($("#new_blue_player_2"));		
		clearInput($("#new_red_player_1"));		
		clearInput($("#new_red_player_2"));		

	}

}

const checkInput = (val) => {
	if(null == val || "" == val.trim()) {
		return true;
	}
	return false;
}

const clearInput = (ele) => {
	ele.val("");
}

const setupAllMatchups = async function(req, res) {

	return await generateMatchups();

}

const generateMatchups = async () => {
	
	console.log("generate matchups");
	
	let matchups = await db.collection('matchups');
	
	let snapshot = await matchups.get();

	let matchupArr = [];

	let finalArr = await snapshot.docs.map(async(d) => {

	
		let t = matchups.doc(d.id).get();

		await t.then(r => {

			matchupArr.push(r.data())

		});

		if(matchupArr.length == snapshot.docs.length) {
			
			return matchupArr;
		}

	})

	return await finalArr;
	
}

async function loadMatchupsForLineSetting(week) {
	if(week != "select") {
		games = [];
		weekGames = schedule.fullgameschedule.gameentry.filter(e => e.week == week);
		let i = 0;
		weekGames.forEach(g => {
			games[i] = new Game(g.id, g.awayTeam, g.homeTeam, g.date, g.time, getLine(week, g.awayTeam), getLine(week, g.homeTeam));
			i++;
		})

		thisWeek = new Week(week, games);
		populateWeeklyScheduleForLines(thisWeek);
	} else {
		$("#this_week_games_admin").html("");
	}
}

const changeThisLine = (gameId, idToChange, line, side) => {

	let game = thisWeek.games.filter(g => g.id == gameId);
	$("#" + idToChange).val(-line);

	if(side=='away') {
		game[0].awayLine = line / 1;
		game[0].homeLine = -line / 1;
	} else {
		game[0].awayLine = -line / 1;
		game[0].homeLine = line / 1;
	}

}

const populateWeeklyScheduleForLines = async (thisWeek) => {

	let thisWeekLines = getThisWeekLines(thisWeek.week);

	$("#this_week_games_admin").html("");

	thisWeekLines.then(
		result => {

			let table = TABLE_OPEN;

			let data = "";

			let week = result;

			thisWeek.games.forEach(g => {

				try {

					if(week.game[g.id] != null ) {
						
						g.awayLine = week.game[g.id].away_team.line;
						g.homeLine = week.game[g.id].home_team.line;
			
					} else {
						g.awayLine = 1.5;
						g.homeLine = -1.5;
					}
				
				} catch {
					console.log('Lines not yet set for this week: ' + thisWeek.week);
				}

				data += TR_OPEN + 
					getTeamCard(g.awayTeam, g.id) +
					TD_OPEN + "<input class = 'line' id='" + g.id + "_" + g.awayTeam.Abbreviation + "' gameId='" + g.id + "' abbr='" + g.awayTeam.Abbreviation + "' nickname='" + g.awayTeam.Name + "' homeAway='AWAY' oninput='changeThisLine(" + g.id + "," + "\"" + g.id + "_" + g.homeTeam.Abbreviation + "\"" + ", this.value, \"away\")' type='number' step='1' size='4' value='" + g.awayLine + "'>" + TD_CLOSE +
					TD_OPEN + "@" + TD_CLOSE + 
					getTeamCard(g.homeTeam, g.id) +
					TD_OPEN + "<input class = 'line' id='" + g.id + "_" + g.homeTeam.Abbreviation + "' gameId='" + g.id + "' abbr='" + g.homeTeam.Abbreviation + "' nickname='" + g.homeTeam.Name + "' homeAway='HOME' oninput='changeThisLine(" + g.id + "," + "\"" + g.id + "_" + g.awayTeam.Abbreviation + "\"" + ", this.value, \"home\")' type='number' step='1' size='4' value='" + g.homeLine + "'>" + TD_CLOSE +
					TD_OPEN + g.date + TD_CLOSE +
					TD_OPEN + g.time + TD_CLOSE +
				TR_CLOSE
			})

			table += data;
			table += TABLE_CLOSE;

			$("#this_week_games_admin").html(table);
		},
		error => {
			console.log(error);
		});
	
}

// const getLine = (week, team) => {
// 	return 1.5;
// }

// const prettyPrintTheLine = (line) => {
// 	if(line > 0) {
// 		return " +" + line;
// 	} else {
// 		return " -" + line;
// 	}
// }

/*const loadData = async () => {

	console.log("loading data");

	let promiseSchedule = getCurrentMatchups();

	promiseSchedule.then(
		result => {
			schedule = result;

			let promise = new Promise(function(resolve, reject) {
			 	resolve(getGameWeek());
			});

			promise.then(
				result => {
					$("#select_week_dropdown_admin").val(result);	
					loadMatchupsForLineSetting(result);
				},
				error => {
					console.log(error);
				})
		},
		error => {
			console.log(error);
		}
	)

}
*/
/*const getPickInfoFromAbbr = (abbr) => {

	// let val = null;
	let game = games.filter(g => g.homeTeam.Abbreviation == abbr || g.awayTeam.Abbreviation == abbr); 
	if(game[0].homeTeam.Abbreviation == abbr) {
		return new Pick(game[0].homeTeam.Abbreviation, game[0].awayTeam.Abbreviation, game[0].homeLine);
	} else {
		return new Pick(game[0].awayTeam.Abbreviation, game[0].homeTeam.Abbreviation, game[0].awayLine);
	}
}*/

const reviewLines = () => {

	let lines = [ ...$(".line")];
	
	let allIds = new Set();
	// let uniqueIds = new Set[...]
	lines.forEach(l => {
		allIds.add(l.getAttribute("gameId"));

	});
	let pushLineUpdate = [];

	let data = {};
	allIds.forEach(id => {

		let idLines = lines.filter(l => l.getAttribute("gameId") == id);

		let away = idLines.filter(l => l.getAttribute('homeaway') == "AWAY");
		let home = idLines.filter(l => l.getAttribute('homeaway') == "HOME")

		data[id] = {
			away_team: {
				line: away[0].value,
				name: away[0].getAttribute('nickname')
			},
			home_team: {
				line: home[0].value,
				name: home[0].getAttribute('nickname')
			}
		}

	})

	let weekUpdate = {}

	let game = {
		game:data
	}

	weekUpdate[$("#select_week_dropdown_admin").val()] = {
		game :
			data
	}

	let fs = firebase.firestore();
	
	let linesCollection = fs.collection('lines');//('lines/201920/week/1/game/51461/away_team/line');
	
	let year = linesCollection.doc('201920');

	let week = year.collection('week');

	let weekOne = week.doc($("#select_week_dropdown_admin").val());

	let setDoc = weekOne.set(game);

}