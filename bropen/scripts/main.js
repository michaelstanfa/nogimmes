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

const showHideSection = async (sectionId) => {
	if($('#' + sectionId).attr('hidden')) {
		$('#' + sectionId).attr('hidden', false);
	} else {
		$('#' + sectionId).attr('hidden', true);
	}
	
}

//throw in the correct round
const loadMatchupTable = async (round) => {

	$("#round_display").html("<h3>Round " + round + "</h3>");
	
	//pass round into here
	let retrievedMatchups = await retrieveMatchups(round);

	//also figure out singles or doubles
	$("#matchups").html("");
	setupScorecard(retrievedMatchups, round);

}

const createMatchup = (id, blue1, blue2, red1, red2) => {
	let blue = new Pair("blue", blue1, blue2);
	let red = new Pair("red", red1, red2);
	let h2h = new HeadToHead(id, blue, red);
	matches.push(h2h);
}

const setupScorecard = async (matchups, round) => {
	html = "<div>";
	html = "<table style=\"overflow:auto\">";
  	body = "";

	let roundData = await db.collection('rounds').doc(round.toString()).get();
	console.log(roundData);
	let course = roundData.data().course;
	let courseInfo = await db.collection('courses').doc(course).get();
	let par = courseInfo.data();

	matchNum = 0;

	await matchups[matchups.length - 1].then(async (matchupArr) => {
		console.log(round);
		await matchupArr.forEach(async (matchup) => {

			// matchupsHTML.append() += await buildMatchupTable(matchup);
			let ele = document.getElementById("matchups");
			let table = await buildMatchupTable(matchup, par);
			
			let redTeamList = await matchup.red.team.map(async m => await fetchUserName(m));
			let blueTeamList = await matchup.blue.team.map(async m => await fetchUserName(m));

			let redTeam = await redTeamList[0] + (redTeamList.length == 2 ? " & " + await redTeamList[1] : "");
			let blueTeam = await blueTeamList[0] + (blueTeamList.length == 2 ? " & " + await blueTeamList[1] : "");
			
			let labelRow = document.createElement("tr");
			let labelTd = document.createElement("h5");

			labelTd.setAttribute("colspan", "100%");
			labelTd.innerHTML = redTeam + " vs. " + blueTeam;
			labelRow.appendChild(labelTd);

			ele.appendChild(labelRow);
			ele.appendChild(table);

			let hrTd = document.createElement('hr');

			ele.appendChild(hrTd);

			matchNum++;

		});
	
	});
}

const buildMatchupTable = async (matchup, courseData) => {
	let fragment = document.createDocumentFragment();
	
	let holeRow = document.createElement("tr");
	let redRow = document.createElement("tr");
	let blueRow = document.createElement("tr");
	let parRow = document.createElement("tr");
	let winnerRow = document.createElement("tr");

	let tdClassList = "scorecard";
	let tdClassListLabels = "scorecard_labels"
	
	let holeTd = document.createElement("td");
	holeTd.innerHTML = "Hole";
	holeTd.classList.add(tdClassListLabels);
	holeTd.classList.add(tdClassList);
	holeRow.appendChild(holeTd);

	for (i = 1; i<=9; i++) {
		let holeNumberTd = document.createElement("td");
		let buttonHole = document.createElement("button");
		buttonHole.innerHTML = i;
		buttonHole.setAttribute("value", i);
		buttonHole.classList.add("btn");
		buttonHole.classList.add("btn-primary")
		buttonHole.onclick = function() {
			
			editMatchupHoleScore(matchup, this.value);
			$("#submit-modal").modal("show");
		}

		holeNumberTd.appendChild(buttonHole);
		holeNumberTd.classList.add(tdClassList);

		holeRow.appendChild(holeNumberTd);

	}

	let tdOut = document.createElement("td");
	tdOut.innerHTML="Out";
	tdOut.classList.add(tdClassList);
	holeRow.appendChild(tdOut);

	for (i = 10; i<=18; i++) {
		let holeNumberTd = document.createElement("td");
		let buttonHole = document.createElement("button");
		buttonHole.innerHTML = i;
		buttonHole.setAttribute("value", i);
		buttonHole.classList.add("btn");
		buttonHole.classList.add("btn-primary")
		buttonHole.onclick = function() {

			editMatchupHoleScore(matchup, this.value);
			$("#submit-modal").modal("show");

		}

		holeNumberTd.appendChild(buttonHole);
		holeNumberTd.classList.add(tdClassList);

		holeRow.appendChild(holeNumberTd);

	}
	
	let tdIn = document.createElement("td");
	tdIn.innerHTML="In";
	tdIn.classList.add(tdClassList);
	
	let tdTotal = document.createElement("td");
	tdTotal.innerHTML="Total";
	tdTotal.classList.add(tdClassList);

	let tdHolesWon = document.createElement("td");
	tdHolesWon.innerHTML="Holes Won";
	tdHolesWon.classList.add(tdClassList);

	let tdPointsEarned = document.createElement("td");
	tdPointsEarned.innerHTML="Points";
	tdPointsEarned.classList.add(tdClassList);

	// holeRow.appendChild(holeTd);
	// holeRow.appendChild(td1);
	// holeRow.appendChild(td2);
	// holeRow.appendChild(td3);
	// holeRow.appendChild(td4);
	// holeRow.appendChild(td5);
	// holeRow.appendChild(td6);
	// holeRow.appendChild(td7);
	// holeRow.appendChild(td8);
	// holeRow.appendChild(td9);


	holeRow.appendChild(tdIn);
	holeRow.appendChild(tdTotal);
	holeRow.appendChild(tdHolesWon);
	holeRow.appendChild(tdPointsEarned);
	
	let redTeamScorecardList = await matchup.red.team.map(async m => await fetchScorecardName(m));
	let blueTeamScorecardList = await matchup.blue.team.map(async m => await fetchScorecardName(m));

	let redTeamScorecardName = await redTeamScorecardList[0] + (redTeamScorecardList.length == 2 ? " & " + await redTeamScorecardList[1] : "");
	let blueTeamScorecardName = await blueTeamScorecardList[0] + (blueTeamScorecardList.length == 2 ? " & " + await blueTeamScorecardList[1] : "");
	
	let redLabel = document.createElement("td");
	redLabel.classList.add(tdClassListLabels);
	redLabel.classList.add(tdClassList);
	redLabel.innerHTML = redTeamScorecardName;

	redRow.appendChild(redLabel);

	let blueLabel = document.createElement("td");
	blueLabel.classList.add(tdClassListLabels);
	blueLabel.classList.add(tdClassList);
	blueLabel.innerHTML = blueTeamScorecardName;
	blueRow.appendChild(blueLabel);

	let parLabel = document.createElement("td");
	parLabel.classList.add(tdClassListLabels)
	parLabel.classList.add(tdClassList);
	parLabel.innerHTML = "Par";

	let redOutScore = 0;
	let blueOutScore = 0;
	parRow.appendChild(parLabel);
	for(i = 1; i<=9; i++ ) {
		let tdPar = document.createElement("td");
		tdPar.classList.add(tdClassList);
		tdPar.innerHTML = courseData["par_" + i];
		parRow.appendChild(tdPar);

		let tdRed = document.createElement("td");
		tdRed.classList.add(tdClassList);
		tdRed.innerHTML = Number(matchup.red.score["hole" + i]);
		tdRed.setAttribute("id", matchup.id + "-red-" + i);
		redRow.appendChild(tdRed);
		redOutScore += Number(matchup.red.score["hole" + i]);

		
		let tdBlue = document.createElement("td");
		tdBlue.classList.add(tdClassList);
		tdBlue.innerHTML = Number(matchup.blue.score["hole" + i]);
		tdBlue.setAttribute("id", matchup.id + "-blue-" + i);
		blueRow.appendChild(tdBlue);
		blueOutScore += Number(matchup.blue.score["hole" + i]);
	}

	let redOut = document.createElement("td");
	redOut.classList.add(tdClassList);
	redOut.innerHTML = redOutScore;
	redRow.appendChild(redOut);

	let blueOut = document.createElement("td");
	blueOut.classList.add(tdClassList);
	blueOut.innerHTML = blueOutScore;
	blueRow.appendChild(blueOut);
	
	let parOut = document.createElement("td");
	parOut.classList.add(tdClassList)
	parOut.innerHTML = "Out";

	parRow.appendChild(parOut);

	let redInScore = 0;
	let blueInScore = 0;
	for(i = 10; i<=18; i++ ) {
		let tdPar = document.createElement("td");
		tdPar.classList.add(tdClassList);
		tdPar.innerHTML = courseData["par_" + i];
		parRow.appendChild(tdPar);

		let tdRed = document.createElement("td");
		tdRed.classList.add(tdClassList);
		tdRed.innerHTML = Number(matchup.red.score["hole" + i]);
		tdRed.setAttribute("id", matchup.id + "-red-" + i);
		redRow.appendChild(tdRed);
		redInScore += Number(matchup.red.score["hole" + i]);

		let tdBlue = document.createElement("td");
		tdBlue.classList.add(tdClassList);
		tdBlue.innerHTML = Number(matchup.blue.score["hole" + i]);
		tdBlue.setAttribute("id", matchup.id + "-blue-" + i);
		blueRow.appendChild(tdBlue);
		blueInScore += Number(matchup.blue.score["hole" + i]);
	}
	
	let redIn = document.createElement("td");
	redIn.classList.add(tdClassList);
	redIn.innerHTML = redInScore;
	redRow.appendChild(redIn);

	let redTotal = document.createElement("td");
	redTotal.classList.add(tdClassList);
	redTotal.innerHTML = redInScore + redOutScore;
	redRow.appendChild(redTotal);
	
	let matchupScoreObject = await determineMatchupScoreboard(matchup);
	
	let redHolesWonTd = document.createElement("td");
	redHolesWonTd.classList.add(tdClassList);
	redHolesWon = matchupScoreObject['redHolesWon'];
	redHolesWonTd.innerHTML = redHolesWon;
	redRow.appendChild(redHolesWonTd);

	let redPointsEarnedTd = document.createElement("td");
	redPointsEarnedTd.classList.add(tdClassList);
	redPointsEarned = matchupScoreObject['redPoints'];
	redPointsEarnedTd.innerHTML = redPointsEarned;
	redRow.appendChild(redPointsEarnedTd);

	let blueIn = document.createElement("td");
	blueIn.classList.add(tdClassList);
	blueIn.innerHTML = blueInScore;
	blueRow.appendChild(blueIn);

	let blueTotal = document.createElement("td");
	blueTotal.classList.add(tdClassList);
	blueTotal.innerHTML = Number(blueInScore) + Number(blueOutScore);
	blueRow.appendChild(blueTotal);

	let blueHolesWonTd = document.createElement("td");
	blueHolesWonTd.classList.add(tdClassList);
	blueHolesWon = matchupScoreObject['blueHolesWon'];
	blueHolesWonTd.innerHTML = blueHolesWon;
	blueRow.appendChild(blueHolesWonTd);

	let bluePointsEarnedTd = document.createElement("td");
	bluePointsEarnedTd.classList.add(tdClassList);
	bluePointsEarned = matchupScoreObject['bluePoints'];
	bluePointsEarnedTd.innerHTML = bluePointsEarned;
	blueRow.appendChild(bluePointsEarnedTd);

	let parIn = document.createElement("td");
	parIn.classList.add(tdClassList)
	parIn.innerHTML = "In";

	let parTotal = document.createElement("td");
	parTotal.classList.add(tdClassList)
	parTotal.innerHTML = "Total";

	let parHolesWon = document.createElement("td");
	parHolesWon.classList.add(tdClassList)
	parHolesWon.innerHTML = "Holes Won";

	let parPoints = document.createElement("td");
	parPoints.classList.add(tdClassList)
	parPoints.innerHTML = "Points";

	parRow.appendChild(parIn);
	parRow.appendChild(parTotal);
	parRow.appendChild(parHolesWon);
	parRow.appendChild(parPoints);

	let winnerLabel = document.createElement("td");
	winnerLabel.classList.add(tdClassListLabels)
	winnerLabel.classList.add(tdClassList);
	winnerLabel.innerHTML = "Hole Winner";
	
	winnerRow.appendChild(winnerLabel);

	for (i=1; i<=9; i++) {
		let winnerTd = document.createElement("td");
		winnerTd.classList.add(tdClassList);
		winnerTd.innerHTML = matchup.red.score["hole" + i] == matchup.blue.score["hole" + i] ? "Tie" : (matchup.red.score["hole" + i] < matchup.blue.score["hole" + i] ? "Red" : "Blue");
		winnerRow.appendChild(winnerTd);
	}

	let winnerOut = document.createElement("td");
	winnerOut.classList.add(tdClassList)
	winnerOut.innerHTML = "Out";

	winnerRow.appendChild(winnerOut);

	for (i=10; i<=18; i++) {
		let winnerTd = document.createElement("td");
		winnerTd.classList.add(tdClassList);
		winnerTd.innerHTML = matchup.red.score["hole" + i] == matchup.blue.score["hole" + i] ? "Tie" : (matchup.red.score["hole" + i] < matchup.blue.score["hole" + i] ? "Red" : "Blue");
		winnerRow.appendChild(winnerTd);
	}

	let winnerIn = document.createElement("td");
	winnerIn.classList.add(tdClassList)
	winnerIn.innerHTML = "In";

	winnerRow.appendChild(winnerIn);

	let winnerTotal = document.createElement("td");
	winnerTotal.classList.add(tdClassList)
	winnerTotal.innerHTML = "--";

	winnerRow.appendChild(winnerTotal);

	let winnerHolesWon = document.createElement("td");
	winnerHolesWon.classList.add(tdClassList)
	winnerHolesWon.innerHTML = "--";

	winnerRow.appendChild(winnerHolesWon);

	let winnerPoints = document.createElement("td");
	winnerPoints.classList.add(tdClassList)
	winnerPoints.innerHTML = "--";

	winnerRow.appendChild(winnerPoints);


	// fragment.appendChild(labelRow);
	fragment.appendChild(holeRow);
	fragment.appendChild(redRow);
	fragment.appendChild(blueRow);
	fragment.appendChild(parRow);
	fragment.appendChild(winnerRow);
	
	let table = document.createElement("table");
	table.classList.add("scorecard_table")
	table.appendChild(fragment);

	return table;
	
}

const determineMatchupScoreboard = async (matchup) => {
	let redHolesWon = 0;
	let blueHolesWon = 0;
	let ties = 0;

	let redPoints = 0;
	let bluePoints = 0;
	for(i = 1; i<=18; i++) {

		if(matchup.red.score['hole' + i] < matchup.blue.score['hole' + i]) {
			redHolesWon ++;
		} else if (matchup.red.score['hole' + i] > matchup.blue.score['hole' + i]) {
			blueHolesWon ++
		} else {
			ties ++;
		}
	}

	if (redHolesWon > blueHolesWon) {
		redPoints = 1;
		bluePoints = 0;
	} else if (redHolesWon < blueHolesWon) {
		redPoints = 0;
		bluePoints = 1;
	} else {
		redPoints = .5;
		bluePoints = .5;
	}

	let matchupScoreboard = {
		redHolesWon: redHolesWon,
		blueHolesWon: blueHolesWon,
		ties: ties,
		redPoints: redPoints,
		bluePoints: bluePoints
	}

	await db.collection('rounds').doc(matchup.round.toString()).collection('matchups').doc(matchup.id).update({scoreboard: matchupScoreboard});

	return matchupScoreboard;
}

const editScores = (round, match, hole) => {

	$("#modal_submit_score").attr("team_index", id);
	$("#modal-blue-team-names").html(info['team']['blue'].member1.name + " & " + info['team']['blue'].member2.name);
	$("#modal-red-team-names").html(info['team']['red'].member1.name + " & " + info['team']['red'].member2.name);
 	
	let totalHoles = info['team'].ties + info['team']['red'].score + info['team']['blue'].score

	$("#modal-current-team-scores").html(info['team']['blue'].score + "-" + info['team']['red'].score + ' through ' + totalHoles + ' hole' + (totalHoles == 1 ? '' : 's'));

	populateBlueTeamScores(id, info);
	populateRedTeamScores(id, info);

	$("#submit-modal").modal("show");

}

const editMatchupHoleScore = async (matchup, hole) => {

	$("#matchup-id-for-submit").html(matchup.id);
	$("#matchup-red-team-modal-score").val(matchup.red.score["hole" + hole]);
	$("#matchup-blue-team-modal-score").val(matchup.blue.score["hole" + hole]);

	$("#matchup-hole-number").html("Hole " + hole);
	$("#matchup-round-number").html("Round " + matchup.round);

	let redTeamList = await matchup.red.team.map(async m => await fetchScorecardName(m));
	let redTeam = await redTeamList[0] + (redTeamList.length == 2 ? " & " + await redTeamList[1] : "");
	$("#matchup-red-team-modal-name").html(redTeam);

	let blueTeamList = await matchup.blue.team.map(async m => await fetchScorecardName(m));
	let blueTeam = await blueTeamList[0] + (blueTeamList.length == 2 ? " & " + await blueTeamList[1] : "");
	$("#matchup-blue-team-modal-name").html(blueTeam);

}

const submitCurrentScores = async () => {

	let id = $("#matchup-id-for-submit").html();

	let hole = $("#matchup-hole-number").html();	
	let round = $("#matchup-round-number").html();

	var roundNumber = round.replace(/\D+/g, '');
	var holeNumberOnly = hole.replace(/\D+/g, '');



	let redTeamScore = $("#matchup-red-team-modal-score").val();
	let blueTeamScore = $("#matchup-blue-team-modal-score").val();

	console.log(redTeamScore);
	console.log(blueTeamScore);

	let holeNumber = "hole" + holeNumberOnly;
	let updateObject = {};

	updateObject[`red.score.${holeNumber}`] = redTeamScore;
	updateObject[`blue.score.${holeNumber}`] = blueTeamScore;

	db.collection('rounds').doc(roundNumber.toString()).collection('matchups').doc(id).update(updateObject);

	$("#" + id.toString() + "-red-" + holeNumberOnly).html(redTeamScore);
	$("#" + id.toString() + "-blue-" + holeNumberOnly).html(blueTeamScore);

	$("#matchups").html("");
	loadMatchupTable(roundNumber);
}

const populateBlueTeamScores =(id, info) => {

	let dataRow = ""

	for(i = 1; i <= 18; i ++) {
		dataRow += "<td><input class='modal-scorecard-score-input-box' disabled=true onfocus='this.value=\"\"' value=" + info.team.blue.scores["score_" + i] + " type=text pattern=\"\\d*\" size=4 id='score-blue-id_" + id + "_hole_"  + i + "'></input></td>";
	}

	$("#modal-blue-team-scores").html(dataRow);

}

const populateRedTeamScores =(id, info) => {

	let dataRow = ""

	for(i = 1; i <= 18; i ++) {
		dataRow += "<td><input class='modal-scorecard-score-input-box' disabled=true onfocus='this.value=\"\"' value=" + info.team.red.scores["score_" + i] + " type=text pattern=\"\\d*\" size=4 id ='score-red-id_" + id + "_hole_"  + i + "'></input></td>";
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

const unlockModalScoreEditing = () => {
	$("#modal_submit_score").attr("disabled", false);
	$(".modal-scorecard-score-input-box").attr("disabled", false);
}