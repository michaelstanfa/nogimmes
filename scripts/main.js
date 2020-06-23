let schedule = null;
let thisWeek = null;
let picks = null;
let choices = null;
let weekGames = null;
let games = [];
let submittingPicks = {};
//match is a list of the head to head objects
let matches = [];

var TABLE_OPEN = "<table class='table'>";
var TABLE_CLOSE = "</table>";
var TH_OPEN = "<th>";
var TH_CLOSE = "</th>"
var TR_OPEN = "<tr>";
var TR_CLOSE = "</tr>";
var TD_OPEN = "<td>";
var TD_CLOSE = "</td>";
var DIV_OPEN = "<div>";
var DIV_CLOSE = "</div>";
var br = "</br>";

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
	this.team = team;
	this.against = against;
	this.line = line;
}

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


const getSchedule = async () => {
	return new Promise(function(resolve, reject){
		if(null == schedule) {
			resolve(retrieveSched());
		} else {
			resolve(schedule);
		}	
	})
}

const selectThisCard = (card) => {

	if(card.hasAttribute("selected")) {

		card.removeAttribute("selected");
		card.setAttribute("bgcolor", "");
	} else {

		card.setAttribute("selected", "");
		card.setAttribute("bgcolor", "#C0C0C0");
	}
}

const getTeamCard = (team, line) => {
	return '<td class="team_option" abbr=' + team.Abbreviation + ' onclick=selectThisCard(this)>' + team.Name + prettyPrintTheLine(line) + TD_CLOSE;

}

async function retrieveSched() {

	return $.ajax
	({
		type: "GET",
		url: "https://api.mysportsfeeds.com/v1.2/pull/nfl/2019-regular/full_game_schedule.json",
		dataType: 'json',
		async: true,
		headers: {
	      "Authorization": "Basic " + btoa(creds.id + ":" + creds.secret)
	    },
	   	error: function(XMLHttpRequest, textStatus, errorThrown) {
	   		console.log("Failed to make call to endpoint");
	   		console.error("Status: " + textStatus);
	   		console.error("Error: " + errorThrown);
	   	}

	})

}

const loadSpecificWeekMatchups = async (week) => {

	if(week != "select") {
		let result = "";
		weekGames = schedule.fullgameschedule.gameentry.filter(e => e.week == week);

		result = await loadWeekGames(weekGames);

		thisWeek = new Week(week, result);

		await populateWeeklySchedule(thisWeek);

	} else {

		$("#this_week_games").html("");
	}
}

const loadWeekGames = async (weekGames) => {

	games = [];
	return new Promise(function(resolve, reject) {
		i = 0;
		weekGames.forEach(async (g) => {

			let awayLine = await getLine(g.week, g.id, "away_team");
			let homeLine = await getLine(g.week, g.id, "home_team");

			games[i] = new Game(g.id, g.awayTeam, g.homeTeam, g.date, g.time, awayLine, homeLine);

			i++;
		});
		resolve(games);
	});
}

const populateWeeklySchedule = async (thisWeek) => {

	let table = TABLE_OPEN;
	
	let header = "<h3>Week " +thisWeek.week + "</h3>" +
				"<th>Away</th>" +
				"<th>Home</th>" +
				"<th>Day</th>" +
				"<th>Time</th>";

	let data = new Promise(function(resolve, reject) {
		resolve(getGuts(thisWeek));
	});

	data.then(
		result => {
			table += result + TABLE_CLOSE;
			$("#this_week_games").html(table);
		});

}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const getGuts = async (thisWeek) => {

	await sleep(500);
	let guts = "";
	thisWeek.games.forEach(g => {

		guts += TR_OPEN + 
			getTeamCard(g.awayTeam, g.awayLine) +
			TD_OPEN + "@" + TD_CLOSE + 
			getTeamCard(g.homeTeam, g.homeLine) +
			TD_OPEN + g.date + TD_CLOSE +
			TD_OPEN + g.time + TD_CLOSE +
		TR_CLOSE;
	});

	return guts;
}

const getLine = async (week, id, homeOrAway) => {

	let lines = await getThisWeekLines(week);

	try {
		if(!lines.game[id].home_team.line){
			return Promise.resolve(0);
		}
		if(homeOrAway == "home_team") {

			return Promise.resolve(lines.game[id].home_team.line);

		} else if (homeOrAway == "away_team") {

			return Promise.resolve(lines.game[id].away_team.line);

		} else {
			return new Promise(function(resolve, reject) {
				resolve(0);
			});
		}
	} catch {
		return Promise.resolve(0);
	}	
}


const prettyPrintTheLine = (line) => {
	if(line > 0) {
		return " +" + line;
	} else if (line < 0 ) {
		return " " + line;
	} else {
		return " [--]"
	}
}

const loadMatchupTable = async () => {
	console.log("loading loadMatchupTable");
	$("#matchuptable").html("this is the matchup");

	createMatchup(1,
					"Mike Dolan",
					"Tim Mullan",
					"Dan Wampler",
					"Doug Fulton");

	createMatchup(2,
					"Marc Wampler",
					"Ryan McCauley",
					"Grant Schulte",
					"Joe Hart");

	createMatchup(3, 
					"Kyle Singletary",
					"Ryan Katch",
					"Tyler Hellman",
					"Stephen Humke");

	createMatchup(4,
					"Jeff Houk",
					"Ryan Franz",
					"Adam Schmidt",
					"Matt Seidl");

	createMatchup(5,
					"Ben James",
					"Mitch Maahs",
					"James Gisvold",
					"Stephen Kallenback");

	createMatchup(6, 
					"Adam Dolan",
					"Alex Hoopes",
					"Bill Battistone",
					"Franklin Peitz");

	createMatchup(7, 
					"Will Schwartz",
					"Zach Hagedorn",
					"Nick Kollauf",
					"Nate Bleadorn");

	createMatchup(8, 
					"Andy Mullan",
					"Paul Wampler",
					"Colin Thomas",
					"Tim Marlow");

	createMatchup(9, 
					"RJ Hallman",
					"Michael Stanfa",
					"Ty Fulton",
					"Ryan Mullan");


	setupScorecard(matches)

}

const createMatchup = (id, blue1, blue2, red1, red2) => {
	let blue = new Pair("blue", blue1, blue2);
	let red = new Pair("red", red1, red2);
	let h2h = new HeadToHead(id, blue, red);
	matches.push(h2h);
}

const setupScorecard = (matches) => {
	html = TABLE_OPEN;

	header = TH_OPEN + "#" + TH_CLOSE;
	header += TH_OPEN + "BLUE" + TH_CLOSE;
	header += TH_OPEN + "BLUE HOLES WON" + TH_CLOSE;
	header += TH_OPEN + "SCORE" + TH_CLOSE;
	header += TH_OPEN + "RED HOLES WON" + TH_CLOSE;
	header += TH_OPEN + "RED" + TH_CLOSE;

	body = "";

	matches.forEach(match => {
		body += TR_OPEN;
		body += TD_OPEN + match.id + TD_CLOSE;
		body += TD_OPEN + match.pairOne.playerOne + br + match.pairOne.playerTwo + TD_CLOSE;
		body += "<td><input id='iterator_blue_" + match.id + "' value=0 onchange = 'calculateHeadToHeadScore(this.value, \"blue\"," + match.id + ")'></td>";
		body += "<td id='iterator_score_" + match.id + "'>Even</td>"
		body += "<td><input  id='iterator_red_" + match.id + "' value=0 onchange = 'calculateHeadToHeadScore(this.value, \"red\"," + match.id + ")'></td>";

		body += TD_OPEN + match.pairTwo.playerOne + br + match.pairTwo.playerTwo + TD_CLOSE;

		body += TR_CLOSE;
	});

	html += header + br;
	html += body;


	html += TABLE_CLOSE;



	$("#matchuptable").html(html);

}

const calculateHeadToHeadScore = (value, color, match) => {

	var blueVal = $("#iterator_blue_" + match).val();
	var redVal = $("#iterator_red_" + match).val();

	var score = blueVal - redVal;

	if(score > 0) {
		$("#iterator_score_" + match).html("Blue +" + score);
	} else if (score < 0) {
		$("#iterator_score_" + match).html("Red +" + -score);
	} else {
		$("#iterator_score_" + match).html("Even");
	}

}

const loadData = async () => {

	// loadMatchupTable();

	console.log("loading data");

	

	// let promiseSchedule = getSchedule();

	// promiseSchedule.then(
	// 	result => {
	// 		schedule = result;

	// 		let promise = new Promise(function(resolve, reject) {
	// 		 	resolve(getGameWeek());
	// 		});

	// 		promise.then(
	// 			result => {
	// 				$("#select_week_dropdown").val(result);	
	// 				loadSpecificWeekMatchups(result);
	// 			},
	// 			error => {
	// 				console.log(error);
	// 			})
	// 	},
	// 	error => {
	// 		console.log(error);
	// 	}
	// )
}

const getPickInfoFromAbbr = (abbr) => {

	let val = null;
	let game = games.filter(g => g.homeTeam.Abbreviation == abbr || g.awayTeam.Abbreviation == abbr); 
	if(game[0].homeTeam.Abbreviation == abbr) {
		return new Pick(game[0].homeTeam.Abbreviation, game[0].awayTeam.Abbreviation, game[0].homeLine);
	} else {
		return new Pick(game[0].awayTeam.Abbreviation, game[0].homeTeam.Abbreviation, game[0].awayLine);
	}
}

const validatePicks = () => {

	cardChoices = [ ...$(".team_option")];

	cardPicks = cardChoices.filter(c => c.hasAttribute("selected"));

	choices = cardPicks.map(c => c.abbr);

	picks = choices.filter(c => c != "NONE");

	if(cardPicks.length != 3) {
		alert("Pick 3 and only 3 games.");
	} else {
		var options = {
			'show':true
		};
		submittingPicks = [];
		picks.forEach(p => {
			submittingPicks[p] = getPickInfoFromAbbr(p);
		})

		let display = [];
		for (let [k, v] of Object.entries(submittingPicks)) {
			display.push(v.team + " " + prettyPrintTheLine(v.line) + " against " + v.against);
		}

		$("#modal-picks").html(display.join("<br />"));
		$("#submit-modal").modal(options);
	}

}