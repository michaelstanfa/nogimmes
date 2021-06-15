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
			
			
			ele.appendChild(table);
			matchNum++;



			//need to know singles or doubles
			let team = matchup['team'];
			console.log(team);
			let rowColor = "#d3d3d3";
			// if(team.advantage.team == 'Blue') {
			// 	rowColor = '#00DCFF';
			// } else if (team.advantage.team == 'Red') {
			// 	rowColor = '#FF8A8A';
			// }

			body += "<tr bgcolor = " + rowColor + ">";
			// body += TD_OPEN + matchNum + TD_CLOSE;

			// let totalHoles = team.blue.score + team.red.score + team.ties;

			// body += "<td align='center'>" + team.blue.member1.name + br + team.blue.member2.name + TD_CLOSE;
			// body += "<td align='center'><b>" + team.blue.score + " - " + team.red.score + "</b><br>thru " + totalHoles + "<br><button class='btn btn-info' onclick='openUserModal(" + JSON.stringify(matchup) + ", " + matchNum + ")' id='update_score_" + matchNum + "data-target='#submit-modal' data-toggle='modal'>Scorecard</button>" + TD_CLOSE;
			// body += "<td align='center'>" + team.red.member1.name + br + team.red.member2.name + TD_CLOSE + "</tr>"
			// body += TR_CLOSE;

		});

		// let total = "";
		// total += TR_OPEN;
		// // total += TH_OPEN + TH_CLOSE;
		// total += "<td align = 'center'><h5>" + "BLUE" + "<h5></td>";
		// total += "<td align = 'center'><h5>" + await calculateTotalPoints("blue", matchups) + " - " + await calculateTotalPoints("red", matchups) + "<h5>" + TD_CLOSE;
		// total += "<td align = 'center'><h5>" + "RED " + "</h5>" + TD_CLOSE;
		// total += TR_CLOSE;

		// let holeCount = "";
		// holeCount += TR_OPEN;
		// // holeCount += TH_OPEN + TH_CLOSE;
		// holeCount += "<td align = 'center'><h5>" + "Hole Count" + "<h5></td>";;
		// holeCount += "<td align = 'center'><h5>" + await calculateTotalHolesWon("blue", matchups) + " - " + await calculateTotalHolesWon("red", matchups) + "<h5></td>";;
		// holeCount += "<td align = 'center'><h5>" + "<h5></td>";;
		// holeCount += TR_CLOSE;

		// html += total;
		// html += body;
		// html += holeCount;

		// html += TABLE_CLOSE + "</div>"

		// $("#matchups").html(matchupsHTML);		
	});
}

const buildMatchupTable = async (matchup, courseData) => {
	let fragment = document.createDocumentFragment();
	
	let redTeamList = await matchup.red.team.map(async m => await fetchUserName(m));
	let blueTeamList = await matchup.blue.team.map(async m => await fetchUserName(m));

	let redTeam = await redTeamList[0] + (redTeamList.length == 2 ? " & " + await redTeamList[1] : "");
	let blueTeam = await blueTeamList[0] + (blueTeamList.length == 2 ? " & " + await blueTeamList[1] : "");
	
	let labelRow = document.createElement("tr");
	let labelTd = document.createElement("td");
	labelTd.setAttribute("colspan", "100%");
	labelTd.innerHTML = redTeam + " vs. " + blueTeam;
	labelRow.appendChild(labelTd);


	let holeRow = document.createElement("tr");
	let redRow = document.createElement("tr");
	let blueRow = document.createElement("tr");
	let parRow = document.createElement("tr");
	let winnerRow = document.createElement("tr");

	holeRow.classList.add("scorecard_labels");
	redRow.classList.add("scorecard_labels");
	blueRow.classList.add("scorecard_labels");
	parRow.classList.add("scorecard_labels");
	winnerRow.classList.add("scorecard_labels");

	let tdClassList = "scorecard";
	let tdClassListLabels = "scorecard_labels"
	
	let holeTd = document.createElement("td");
	holeTd.innerHTML = "Hole";
	holeTd.classList.add(tdClassListLabels);

	holeRow.appendChild(holeTd);

	for (i = 1; i<=9; i++) {
		let holeNumberTd = document.createElement("td");
		let buttonHole = document.createElement("button");
		buttonHole.innerHTML = i;
		buttonHole.setAttribute("value", i);
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
	redLabel.innerHTML = redTeamScorecardName;

	redRow.appendChild(redLabel);

	let blueLabel = document.createElement("td");
	blueLabel.classList.add(tdClassListLabels);
	blueLabel.innerHTML = blueTeamScorecardName;
	blueRow.appendChild(blueLabel);

	let parLabel = document.createElement("td");
	parLabel.classList.add(tdClassListLabels)
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
		tdRed.innerHTML = matchup.red.score["hole" + i];
		tdRed.setAttribute("id", matchup.id + "-red-" + i);
		redRow.appendChild(tdRed);
		redOutScore += matchup.red.score["hole" + i];

		
		let tdBlue = document.createElement("td");
		tdBlue.classList.add(tdClassList);
		tdBlue.innerHTML = matchup.blue.score["hole" + i];
		tdBlue.setAttribute("id", matchup.id + "-blue-" + i);
		blueRow.appendChild(tdBlue);
		blueOutScore += matchup.blue.score["hole" + i];
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
		tdRed.innerHTML = matchup.red.score["hole" + i];
		tdRed.setAttribute("id", matchup.id + "-red-" + i);
		redRow.appendChild(tdRed);
		redInScore += matchup.red.score["hole" + i];

		let tdBlue = document.createElement("td");
		tdBlue.classList.add(tdClassList);
		tdBlue.innerHTML = matchup.blue.score["hole" + i];
		tdBlue.setAttribute("id", matchup.id + "-blue-" + i);
		blueRow.appendChild(tdBlue);
		blueInScore += matchup.blue.score["hole" + i];
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
	blueTotal.innerHTML = blueInScore + blueOutScore;
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
	winnerLabel.innerHTML = "Hole Winner";
	
	winnerRow.appendChild(winnerLabel);

	for (i=1; i<=9; i++) {
		let winnerTd = document.createElement("td");
		winnerTd.classList.add(tdClassList);
		winnerTd.innerHTML = matchup.red.score["hole" + i] == matchup.blue.score["hole" + i] ? "--" : (matchup.red.score["hole" + i] < matchup.blue.score["hole" + i] ? "Red" : "Blue");
		winnerRow.appendChild(winnerTd);
	}

	let winnerOut = document.createElement("td");
	winnerOut.classList.add(tdClassList)
	winnerOut.innerHTML = "Out";

	winnerRow.appendChild(winnerOut);

	for (i=10; i<=18; i++) {
		let winnerTd = document.createElement("td");
		winnerTd.classList.add(tdClassList);
		winnerTd.innerHTML = matchup.red.score["hole" + i] == matchup.blue.score["hole" + i] ? "--" : (matchup.red.score["hole" + i] < matchup.blue.score["hole" + i] ? "Red" : "Blue");
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


	fragment.appendChild(labelRow);
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
	console.log(matchup.id);
	$("#matchup-id-for-submit").html(matchup.id);
	$("#matchup-red-team-modal-score").val(matchup.red.score["hole" + hole]);
	$("#matchup-blue-team-modal-score").val(matchup.blue.score["hole" + hole]);

	$("#matchup-hole-number").html("Hole " + hole);
	$("#matchup-round-number").html("Round " + matchup.round);

	let redTeamList = await matchup.red.team.map(async m => await fetchUserName(m));
	let redTeam = await redTeamList[0] + (redTeamList.length == 2 ? " & " + await redTeamList[1] : "");
	$("#matchup-red-team-modal-name").html(redTeam);

	let blueTeamList = await matchup.blue.team.map(async m => await fetchUserName(m));
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

	buildMatchupTable(matchup);	

	// let id = 
	
	// let matchups = await db.collection("matchups");
	// let id = $("#modal_submit_score").attr("team_index");

	// let matchup = await matchups.doc(id.toString()).get();

	// let red = matchup.data()['team']['red'];
	// let blue = matchup.data()['team']['blue'];
	// let advantage = matchup.data()['team']['advantage']

	// let blue_score = {
	// 	score_1: $("#score-blue-id_" + id + "_hole_1").val(),
	// 	score_2: $("#score-blue-id_" + id + "_hole_2").val(),
	// 	score_3: $("#score-blue-id_" + id + "_hole_3").val(),
	// 	score_4: $("#score-blue-id_" + id + "_hole_4").val(),
	// 	score_5: $("#score-blue-id_" + id + "_hole_5").val(),
	// 	score_6: $("#score-blue-id_" + id + "_hole_6").val(),
	// 	score_7: $("#score-blue-id_" + id + "_hole_7").val(),
	// 	score_8: $("#score-blue-id_" + id + "_hole_8").val(),
	// 	score_9: $("#score-blue-id_" + id + "_hole_9").val(),
	// 	score_10: $("#score-blue-id_" + id + "_hole_10").val(),
	// 	score_11: $("#score-blue-id_" + id + "_hole_11").val(),
	// 	score_12: $("#score-blue-id_" + id + "_hole_12").val(),
	// 	score_13: $("#score-blue-id_" + id + "_hole_13").val(),
	// 	score_14: $("#score-blue-id_" + id + "_hole_14").val(),
	// 	score_15: $("#score-blue-id_" + id + "_hole_15").val(),
	// 	score_16: $("#score-blue-id_" + id + "_hole_16").val(),
	// 	score_17: $("#score-blue-id_" + id + "_hole_17").val(),
	// 	score_18: $("#score-blue-id_" + id + "_hole_18").val()
	// }

	// let red_score = {
	// 	score_1: $("#score-red-id_" + id + "_hole_1").val(),
	// 	score_2: $("#score-red-id_" + id + "_hole_2").val(),
	// 	score_3: $("#score-red-id_" + id + "_hole_3").val(),
	// 	score_4: $("#score-red-id_" + id + "_hole_4").val(),
	// 	score_5: $("#score-red-id_" + id + "_hole_5").val(),
	// 	score_6: $("#score-red-id_" + id + "_hole_6").val(),
	// 	score_7: $("#score-red-id_" + id + "_hole_7").val(),
	// 	score_8: $("#score-red-id_" + id + "_hole_8").val(),
	// 	score_9: $("#score-red-id_" + id + "_hole_9").val(),
	// 	score_10: $("#score-red-id_" + id + "_hole_10").val(),
	// 	score_11: $("#score-red-id_" + id + "_hole_11").val(),
	// 	score_12: $("#score-red-id_" + id + "_hole_12").val(),
	// 	score_13: $("#score-red-id_" + id + "_hole_13").val(),
	// 	score_14: $("#score-red-id_" + id + "_hole_14").val(),
	// 	score_15: $("#score-red-id_" + id + "_hole_15").val(),
	// 	score_16: $("#score-red-id_" + id + "_hole_16").val(),
	// 	score_17: $("#score-red-id_" + id + "_hole_17").val(),
	// 	score_18: $("#score-red-id_" + id + "_hole_18").val()
	// }

	// let red_wins = 0;
	// let blue_wins = 0;
	// let tie = 0;

	// for(i = 1; i <= 18; i++) {
	// 	let b = blue_score['score_' + i];
	// 	let r = red_score['score_' + i];
	// 	if(b < r) {
	// 		blue_wins ++;
	// 	} else if(r < b) {
	// 		red_wins ++;
	// 	} else {
	// 		if(b != 0 & r != 0){
	// 			tie ++;	
	// 		}	
	// 	}
	// }

	// if(blue_wins > red_wins) {
	// 	advantage = {
	// 		team: "Blue"
	// 	}
	// } else if(red_wins > blue_wins ) {
	// 	advantage = {
	// 		team: "Red"
	// 	}
	// } else {
	// 	advantage = {
	// 		team: "Even"
	// 	}
	// }

	// ties = tie;

	// blue.score = blue_wins;
	// red.score = red_wins;

	// blue.scores = blue_score;
	// red.scores = red_score;

	// db.collection("matchups").doc(id.toString()).set({
	// 	team: {blue, red, advantage, ties}
	// }).then(function() {
	//     console.log("Document successfully written!");
	// 	location.reload();
	// })

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