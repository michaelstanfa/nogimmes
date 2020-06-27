
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
	html = "<div>";
	html = "<table style=\"overflow:auto\">";
  	body = "";

	matchNum = 0;
	await matchups[matchups.length - 1].then(async (matchupArr) => {
		await matchupArr.forEach(async (matchup) => {

			matchNum++;

			let team = matchup['team'];

			let rowColor = '#b3b3b3';
			if(team.advantage.team == 'Blue') {
				rowColor = '#7979ff';
			} else if (team.advantage.team == 'Red') {
				rowColor = '#ff6666';
			}

			body += "<tr bgcolor = " + rowColor + ">";
			body += TD_OPEN + matchNum + TD_CLOSE;
			body += TD_OPEN + team.blue.member1.name + br + team.blue.member2.name + TD_CLOSE;
			body += TD_OPEN + team.blue.score + " - " + team.red.score + TD_CLOSE
			body += TD_OPEN + team.red.member1.name + br + team.red.member2.name + TD_CLOSE
			body += "<td><button onclick='openUserModal(" + JSON.stringify(matchup) + ", " + matchNum + ")' id='update_score_" + matchNum + "data-target='#submit-modal' data-toggle='modal'>Scorecard</button></td>";
			body += TR_CLOSE;

		});

		let total = "";
		total += TR_OPEN;
		total += TH_OPEN + TH_CLOSE;
		total += TH_OPEN + "BLUE" + TH_CLOSE;
		total += TH_OPEN + await calculateTotalPoints("blue", matchups) + " - " + await calculateTotalPoints("red", matchups) + TH_CLOSE;
		total += TH_OPEN + "RED " + TH_CLOSE;
		total += TR_CLOSE;

		let holeCount = "";
		holeCount += TR_OPEN;
		holeCount += TH_OPEN + TH_CLOSE;
		holeCount += TH_OPEN + "Hole Count" + TH_CLOSE;
		holeCount += TH_OPEN + await calculateTotalHolesWon("blue", matchups) + " - " + await calculateTotalHolesWon("red", matchups) + TH_CLOSE;
		holeCount += TH_OPEN + TH_CLOSE;
		holeCount += TR_CLOSE;

		html += total;
		html += body;
		html += holeCount;

		html += TABLE_CLOSE + "</div>"

		$("#matchuptable").html(html);

	})		

}

const openUserModal = (info, id) => {

	populateHoles();
	$("#modal_submit_score").attr("team_index", id);
	$("#modal-blue-team-names").html(info['team']['blue'].member1.name + " & " + info['team']['blue'].member2.name);
	$("#modal-red-team-names").html(info['team']['red'].member1.name + " & " + info['team']['red'].member2.name);

	populateBlueTeamScores(id, info);
	populateRedTeamScores(id, info);

	$("#submit-modal").modal("show");

}

const openPictureModal = () => {
	$("#rain-modal").modal("show");
}

const submitCurrentScores = async () => {
	
	let matchups = await db.collection("matchups");
	let id = $("#modal_submit_score").attr("team_index");

	let matchup = await matchups.doc(id.toString()).get();

	let red = matchup.data()['team']['red'];
	let blue = matchup.data()['team']['blue'];
	let advantage = matchup.data()['team']['advantage']

	let blue_score = {
		score_1: $("#score-blue-id_" + id + "_hole_1").val(),
		score_2: $("#score-blue-id_" + id + "_hole_2").val(),
		score_3: $("#score-blue-id_" + id + "_hole_3").val(),
		score_4: $("#score-blue-id_" + id + "_hole_4").val(),
		score_5: $("#score-blue-id_" + id + "_hole_5").val(),
		score_6: $("#score-blue-id_" + id + "_hole_6").val(),
		score_7: $("#score-blue-id_" + id + "_hole_7").val(),
		score_8: $("#score-blue-id_" + id + "_hole_8").val(),
		score_9: $("#score-blue-id_" + id + "_hole_9").val(),
		score_10: $("#score-blue-id_" + id + "_hole_10").val(),
		score_11: $("#score-blue-id_" + id + "_hole_11").val(),
		score_12: $("#score-blue-id_" + id + "_hole_12").val(),
		score_13: $("#score-blue-id_" + id + "_hole_13").val(),
		score_14: $("#score-blue-id_" + id + "_hole_14").val(),
		score_15: $("#score-blue-id_" + id + "_hole_15").val(),
		score_16: $("#score-blue-id_" + id + "_hole_16").val(),
		score_17: $("#score-blue-id_" + id + "_hole_17").val(),
		score_18: $("#score-blue-id_" + id + "_hole_18").val()
	}

	let red_score = {
		score_1: $("#score-red-id_" + id + "_hole_1").val(),
		score_2: $("#score-red-id_" + id + "_hole_2").val(),
		score_3: $("#score-red-id_" + id + "_hole_3").val(),
		score_4: $("#score-red-id_" + id + "_hole_4").val(),
		score_5: $("#score-red-id_" + id + "_hole_5").val(),
		score_6: $("#score-red-id_" + id + "_hole_6").val(),
		score_7: $("#score-red-id_" + id + "_hole_7").val(),
		score_8: $("#score-red-id_" + id + "_hole_8").val(),
		score_9: $("#score-red-id_" + id + "_hole_9").val(),
		score_10: $("#score-red-id_" + id + "_hole_10").val(),
		score_11: $("#score-red-id_" + id + "_hole_11").val(),
		score_12: $("#score-red-id_" + id + "_hole_12").val(),
		score_13: $("#score-red-id_" + id + "_hole_13").val(),
		score_14: $("#score-red-id_" + id + "_hole_14").val(),
		score_15: $("#score-red-id_" + id + "_hole_15").val(),
		score_16: $("#score-red-id_" + id + "_hole_16").val(),
		score_17: $("#score-red-id_" + id + "_hole_17").val(),
		score_18: $("#score-red-id_" + id + "_hole_18").val()
	}

	let red_wins = 0;
	let blue_wins = 0;
	let ties = 0;

	for(i = 1; i <= 18; i++) {
		let b = blue_score['score_' + i];
		let r = red_score['score_' + i];
		if(b < r) {
			blue_wins ++;
		} else if(r < b) {
			red_wins ++;
		} else {
			ties ++;
		}

	}

	if(blue_wins > red_wins) {
		advantage = {
			team: "Blue"
		}
	} else if(red_wins > blue_wins ) {
		advantage = {
			team: "Red"
		}
	} else {
		advantage = {
			team: "Even"
		}
	}

	blue.score = blue_wins;
	red.score = red_wins;

	blue.scores = blue_score;
	red.scores = red_score;

	db.collection("matchups").doc(id.toString()).set({
		team: {blue, red, advantage}
	}).then(function() {
	    console.log("Document successfully written!");
		location.reload();
	})
}

const populateBlueTeamScores =(id, info) => {

	let dataRow = ""

	for(i = 1; i <= 18; i ++) {
		dataRow += "<td><input onfocus='this.value=\"\"' value=" + info.team.blue.scores["score_" + i] + " type=text pattern=\"\\d*\" size=4 id='score-blue-id_" + id + "_hole_"  + i + "'></input></td>";
	}

	$("#modal-blue-team-scores").html(dataRow);

}

const populateRedTeamScores =(id, info) => {

	let dataRow = ""

	for(i = 1; i <= 18; i ++) {
		dataRow += "<td><input onfocus='this.value=\"\"' value=" + info.team.red.scores["score_" + i] + " type=text pattern=\"\\d*\" size=4 id ='score-red-id_" + id + "_hole_"  + i + "'></input></td>";
	}

	$("#modal-red-team-scores").html(dataRow);

} 


const populateHoles = () => {

	let holeHeaderRow = "";

	for(i = 1; i <= 18; i ++) {
		holeHeaderRow += "<td>" + i + "</td>";
	}

	$(".holes").html(holeHeaderRow);

}

const calculateTotalPoints = async (team, matchups) => {

	let val = await matchups[matchups.length - 1].then(async (matchupArr) => {
		redScore = 0;
		blueScore = 0;

		await matchupArr.forEach(matchup => {

			let team = matchup['team'];
			if(team.advantage.team == "Red") {
				redScore += 1;
			} else if (team.advantage.team == "Blue") {
				blueScore += 1;
			} else {
				redScore += .5;
				blueScore += .5;
			}
			
		});

		if (team == "blue") {
			return blueScore;
		} else {
			return redScore;
		}
	})

	return val;

}

const calculateTotalHolesWon = async (team, matchups) => {
	let val = await matchups[matchups.length - 1].then(async (matchupArr) => {
		score = 0;
		await matchupArr.forEach(matchup => {

			score += matchup['team'][team].score
			
		});
		return score;
	})

	console.log(val);
	return val;
}

const setScore = (color, blueValue, redValue, match) => {

	setScoreForMatchup(match, blueValue, redValue);

}

const calculateHeadToHeadScore = (value, color, match) => {

	var blueVal = $("#iterator_blue_" + match).value;
	var redVal = $("#iterator_red_" + match).value;

	var score = blueVal - redVal;

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
