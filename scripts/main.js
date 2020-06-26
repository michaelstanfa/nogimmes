
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


const loadMatchupTable = async () => {
	

	let retrievedMatchups = await retrieveMatchups();

	setupScorecard(retrievedMatchups);

}

const createMatchup = (id, blue1, blue2, red1, red2) => {
	let blue = new Pair("blue", blue1, blue2);
	let red = new Pair("red", red1, red2);
	let h2h = new HeadToHead(id, blue, red);
	matches.push(h2h);
}

const setupScorecard = async (matchups) => {
	html = TABLE_OPEN;

	header = TH_OPEN + "#" + TH_CLOSE;
	header += TH_OPEN + "BLUE" + TH_CLOSE;
	header += TH_OPEN + "BLUE HOLES WON" + TH_CLOSE;
	header += TH_OPEN + "ADV." + TH_CLOSE;
	header += TH_OPEN + "SCORE" + TH_CLOSE;
	header += TH_OPEN + "RED HOLES WON" + TH_CLOSE;
	header += TH_OPEN + "RED" + TH_CLOSE;

	body = "";

	matchNum = 0;
	await matchups[matchups.length - 1].then(async (matchupArr) => {
		await matchupArr.forEach(async (matchup) => {

			matchNum++;

			let team = matchup['team'];
			body += TR_OPEN;
			body += TD_OPEN + matchNum + TD_CLOSE;
			body += TD_OPEN + team.blue.member1.name + br + team.blue.member2.name + TD_CLOSE;
			body += "<td><input type=number id='iterator_blue_" + matchNum + "' value=" + team.blue.score + " onchange = 'setScore(\"blue\", this.value, " + team.red.score + "," + matchNum + ")'></td>";
			body += "<td id='iterator_advantage_" + matchNum + "'>" + team.advantage.team + "</td>";
			body += "<td id='iterator_score_" + matchNum + "'>"+ team.advantage.score + "</td>";
			body += "<td><input type=number id='iterator_red_" + matchNum + "' value=" + team.red.score + " onchange = 'setScore(\"red\", "+ team.blue.score +", this.value, " + matchNum + ")'></td>";
			body += TD_OPEN + team.red.member1.name + br + team.red.member2.name + TD_CLOSE

		});
	
		total = "";
		total += TR_OPEN;
		total += TH_OPEN + "TOTAL POINTS" + TH_CLOSE;
		total += TH_OPEN + "BLUE" + TH_CLOSE;
		total += TH_OPEN + calculateTotalPoints("blue") + TH_CLOSE;
		total += TH_OPEN + TH_CLOSE;
		total += TH_OPEN + "RED" + TH_CLOSE;
		total += TH_OPEN + calculateTotalPoints("red") + TH_CLOSE;

		total += TR_CLOSE;

		html += header + br;
		html += body;
		html += total;

		html += TABLE_CLOSE;

		$("#matchuptable").html(html);

	})		

}

const calculateTotalPoints = (team) => {

	matches.forEach(m => console.log(m))

}

const setScore = (color, blueValue, redValue, match) => {

	console.log(blueValue);
	console.log(redValue);
	setScoreForMatchup(match, blueValue, redValue);

}

const calculateHeadToHeadScore = (value, color, match) => {

	var blueVal = $("#iterator_blue_" + match).value;
	var redVal = $("#iterator_red_" + match).value;

	console.log(blueVal);
	console.log(redVal);

	var score = blueVal - redVal;

	console.log(score);

	setScoreForMatchup(match, blueVal, redVal);

	if(score > 0) {

		$("#iterator_advantage_" + match).html("Blue");
		$("#iterator_score_" + match).html("+" + score);
		
	} else if (score < 0) {
		
		$("#iterator_advantage_" + match).html("Red");
		$("#iterator_score_" + match).html("+" + -score);

	} else {

		$("#iterator_advantage_" + match).html("Even");
		$("#iterator_score_" + match).html("--");

	}

}