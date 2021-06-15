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

function Golfer(id, name, team, scorecardName) {
	this.id = id;
	this.name = name;
	this.team = team;
	this.scorecardName = scorecardName;
}

let currentRoundForAddingMatchup;

const addGolfer = async(name, team, scorecardName) => {

	username = name.toLowerCase().replace(/[^A-Za-z]/g, "");

	if(!name) {
		alert('Please enter a name');
	} else if (!scorecardName){
		alert('Please enter a shorthand name for the scorecard label');
	} else {
	 	let golfers = await db.collection('golfers');

		const golfer = {
			name: name,
			team: team,
			scorecardName: scorecardName
		}
		
		await golfers.doc(username).set(golfer);
	
	}
	
	populateGolfers();

}

const retrieveMatchups = async (round) => {
	return new Promise(async function(resolve, reject){
		resolve(setupAllMatchups(round));
	})
}

const populateAdminRounds = async () => {

	let rounds = await db.collection('rounds');

	let snapshot = await rounds.get();
	let adminRoundSelectorHTML = "";
	snapshot.forEach(r => {
		adminRoundSelectorHTML += "<button class='btn btn-default border border-primary' onClick='displayAdminRound("+r.id+")' value=\"" + r.id + "\">Round " + r.id + " Matchups</button>"; 
	})

	$("#admin_round_selector").html(adminRoundSelectorHTML);

	// let header = "<table class = 'table'><tr><th>#</th><th>Blue Team</th><th>Red Team</th></tr>";

	// let body = "";

	// let matchups = await retrieveMatchups();

	// i = 0;
	// matchups[matchups.length - 1].then(matchupArr => {
	// 	matchupArr.forEach(matchup => {
	// 		i++;
			
	// 		let team = matchup['team'];
	// 		body += "<tr>"
	// 		body += "<td>" + i + "</td>";
	// 		body += "<td>" + team.blue.member1.name + " & " + team.blue.member2.name + "</td>";
	// 		body += "<td>" + team.red.member1.name + " & " + team.red.member2.name + "</td>";
	// 		body += "</tr>";	
	// 	});
	// 	adminMatchupHTML = header + body + "</table>"
	// 	$("#current_matchups").html(adminMatchupHTML);
	// })	

}

const addRound = async () => {
	let rounds = await db.collection('rounds');

	let snapshot = await rounds.get();
	
	let data = {
		scoring: $("#round_scoring_type").val(),
		style: $("#round_style").val(),
		playersPerTeam: $("#round_matchup_team_player_count").val(),
		course: $("#round_course").val(),
	}

	rounds.doc((snapshot.size + 1).toString()).set(data);

	populateAdminRounds();

}

const displayAdminRound = async (roundId) => {

	let round = await db.collection('rounds').doc(roundId.toString());

	let snapshot = await round.get();

	let data = await snapshot.data();

	$("#add_new_matchups").attr('hidden', false);

	$(".round_number").html("<h3>Round " + snapshot.id +"</h3>" + data.course + " | " + data.style.replace("_", " ") + " | " + data.scoring.replace("_", " ") + " | " + data.playersPerTeam + " players per team");

	displayRoundMatchupForAdmin(snapshot.id, data);
	populateAddMatchupDropdowns(snapshot.id, data.playersPerTeam);
	
}

const confirmScore = async (ele) => {
	console.log(ele);
	window.confirm(ele);
}

const editHoleScore = (round, matchup, hole) => {
	
}

const displayRoundMatchupForAdmin = async (round) => {

	$("#current_matchup_rows").html("");
	
	let matchups = await db.collection('rounds').doc(round).collection('matchups');
	let snapshot = await matchups.get();

	var tbodyRef = document.getElementById('current_matchup_rows');

	var headerRow = tbodyRef.insertRow();
	var blueHeader = headerRow.insertCell();
	var redHeader = headerRow.insertCell();
	var lastHeader = headerRow.insertCell();

	blueHeader.appendChild(document.createTextNode("Red"));
	redHeader.appendChild(document.createTextNode("Blue"));
	lastHeader.appendChild(document.createTextNode(""));

	snapshot.docs.forEach(async(d) => {

		var newRow = tbodyRef.insertRow();

		var redCell = newRow.insertCell();
		var blueCell = newRow.insertCell();
		var buttonCell = newRow.insertCell();

		let redTeamList = await d.data().red.team.map(async m => await fetchUserName(m));
		let blueTeamList = await d.data().blue.team.map(async m => await fetchUserName(m));

		console.log(redTeamList);
		
		let redTeam = await redTeamList[0] + (redTeamList.length == 2 ? " & " + await redTeamList[1] : "");
		let blueTeam = await blueTeamList[0] + (blueTeamList.length == 2 ? " & " + await blueTeamList[1] : "");
		let removeButton = $("<button class='btn btn-danger' onClick='removeGroupingFromRound(\"" + d.id + "\"," + round + ")'>Remove Group</button>");

		redCell.appendChild(document.createTextNode(redTeam));
		blueCell.appendChild(document.createTextNode(blueTeam))
		removeButton.appendTo(buttonCell);

	});
}

const addCourse = async (courseName) => {
	let courses = await db.collection('courses');

	let courseUserName = courseName.replace(/[^A-Za-z]/g, "");

	let data = {
		name: $("#course_name").val(),
		par_1 : $('#course_hole_par_1').val(),
		par_2 : $('#course_hole_par_2').val(),
		par_3 : $('#course_hole_par_3').val(),
		par_4 : $('#course_hole_par_4').val(),
		par_5 : $('#course_hole_par_5').val(),
		par_6 : $('#course_hole_par_6').val(),
		par_7 : $('#course_hole_par_7').val(),
		par_8 : $('#course_hole_par_8').val(),
		par_9 : $('#course_hole_par_9').val(),
		par_10 : $('#course_hole_par_10').val(),
		par_11 : $('#course_hole_par_11').val(),
		par_12 : $('#course_hole_par_12').val(),
		par_13 : $('#course_hole_par_13').val(),
		par_14 : $('#course_hole_par_14').val(),
		par_15 : $('#course_hole_par_15').val(),
		par_16 : $('#course_hole_par_16').val(),
		par_17 : $('#course_hole_par_17').val(),
		par_18 : $('#course_hole_par_18').val(),
	}

	courses.doc(courseUserName.toString().toLowerCase()).set(data);

	populateAdminRounds();

}

const populateAdminCourses = async () => {
	let courses = await db.collection('courses');
	let coursesSnapshot = await courses.get();


	// await golfers.doc(bg.id).get().then(r => {
	// 	$("#blue_team_dropdown_1").append("<option value = '" + bg.id + "'>" + r.data().name + "</option>");
	// });

	await coursesSnapshot.docs.forEach(async(course) => {
		course.data().name
		$("#round_course").append("<option value = '" + course.id + "'>" + course.data().name + "</option>");
		//console.log(course.data());
	})

}

const fetchUserName = async (userName) => {
	return new Promise(async function(resolve, reject){
		let user = await fetchUser(userName);
		resolve(user.name);
	})
}

const fetchScorecardName = async (userName) => {
	return new Promise(async function(resolve, reject){
		let user = await fetchUser(userName);
		resolve(user.scorecardName);
	})
}

const fetchUser = async (userName) => {
	let user = await db.collection('golfers').doc(userName).get();
	return user.data();
}

const removeGroupingFromRound = async (id, round) => {
	await db.collection('rounds').doc(round.toString()).collection('matchups').doc(id).delete();
	displayRoundMatchupForAdmin(round.toString());
}

const populateAddMatchupDropdowns = async (round, ppt) => {

	currentRoundForAddingMatchup = round;

	$("#red_team_dropdown_1").html("");
	$("#blue_team_dropdown_1").html("");

	$("#red_team_dropdown_2").html("");
	$("#blue_team_dropdown_2").html("");

	if(ppt == 2) {
		$("#red_team_dropdown_2").attr('hidden', false);
		$("#blue_team_dropdown_2").attr('hidden', false);
	} else {
		$("#red_team_dropdown_2").attr('hidden', true);
		$("#blue_team_dropdown_2").attr('hidden', true);
	}

	//now figuring out the dropdowns for new matchups
	redGolfers = [];
	blueGolfers = [];

	let golfers = await db.collection('golfers');

	let golfersSnapshot = await golfers.get();

	await golfersSnapshot.docs.map(golfer => {

		if(golfer.data().team == "red") {
			redGolfers.push(golfer);
		} else {
			blueGolfers.push(golfer);
		}

	});

	//if 2 players per matchup, need to duplicate the lists, basically. or at least make 2 of them populateable

	await blueGolfers.forEach(async(bg) => {

		await golfers.doc(bg.id).get().then(r => {
			$("#blue_team_dropdown_1").append("<option value = '" + bg.id + "'>" + r.data().name + "</option>");
		});

	})

	await redGolfers.forEach(async(rg) => {

		await golfers.doc(rg.id).get().then(r => {
			$("#red_team_dropdown_1").append("<option value = '" + rg.id + "'>" + r.data().name + "</option>");
		});
				
	})

	if(ppt == 2) {

		await blueGolfers.forEach(async(bg) => {

			await golfers.doc(bg.id).get().then(r => {
				$("#blue_team_dropdown_2").append("<option value = '" + bg.id + "'>" + r.data().name + "</option>");
			});

		})

		await redGolfers.forEach(async(bg) => {

			await golfers.doc(bg.id).get().then(r => {
				$("#red_team_dropdown_2").append("<option value = '" + bg.id + "'>" + r.data().name + "</option>");
			});

		})
	}

}

const addMatchup = async () => {

	let round = await db.collection('rounds').doc(currentRoundForAddingMatchup.toString());
	let snapshot = await round.get();

	let ppt = snapshot.data().playersPerTeam;

	redPlayers = [] 
	redPlayers.push($("#red_team_dropdown_1 :selected").val());
	bluePlayers = []
	bluePlayers.push($("#blue_team_dropdown_1 :selected").val());

	if(ppt == 2) {
		redPlayers.push($("#red_team_dropdown_2 :selected").val());
		bluePlayers.push($("#blue_team_dropdown_2 :selected").val());
	}

	let emptyRound = {
		hole1: 0,
		hole2: 0,
		hole3: 0,
		hole4: 0,
		hole5: 0,
		hole6: 0,
		hole7: 0,
		hole8: 0,
		hole9: 0,
		hole10: 0,
		hole11: 0,
		hole12: 0,
		hole13: 0,
		hole14: 0,
		hole15: 0,
		hole16: 0,
		hole17: 0,
		hole18: 0
	}	

	updateData = {
		round: round.id,
		red: {
			team: redPlayers,
			score: emptyRound
		},
		blue: {
			team: bluePlayers,
			score: emptyRound
		}
	}

	let matchups = await db.collection('rounds').doc(currentRoundForAddingMatchup.toString()).collection('matchups')

	let matchupSize = await matchups.get().then(shard => {
		return shard.size;
	});
	
	let docRef = await matchups.add(updateData);
	await docRef.update({id: docRef.id});

	displayRoundMatchupForAdmin(currentRoundForAddingMatchup.toString());

}

const addNewMatchup = async () => {

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
				score: parseInt(0),
				scores: {
					score_1: 0,
					score_2: 0,
					score_3: 0,
					score_4: 0,
					score_5: 0,
					score_6: 0,
					score_7: 0,
					score_8: 0,
					score_9: 0,
					score_10: 0,
					score_11: 0,
					score_12: 0,
					score_13: 0,
					score_14: 0,
					score_15: 0,
					score_16: 0,
					score_17: 0,
					score_18: 0
				}
			}
		let red = {
				member1: {"name" : red1},
				member2: {"name" : red2},
				score: parseInt(0),
				scores: {
					score_1: 0,
					score_2: 0,
					score_3: 0,
					score_4: 0,
					score_5: 0,
					score_6: 0,
					score_7: 0,
					score_8: 0,
					score_9: 0,
					score_10: 0,
					score_11: 0,
					score_12: 0,
					score_13: 0,
					score_14: 0,
					score_15: 0,
					score_16: 0,
					score_17: 0,
					score_18: 0
				}
			}
		let advantage = {
			team: "Even",
			score: parseInt(0)
		}
		
		let ties = 0;


		db.collection("matchups").doc(index.toString()).set({
			team: {blue, red, advantage, ties}
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

const setupAllMatchups = async (round) => {

	return await generateMatchups(round);

}


const generateMatchups = async (r) => {
	
	let matchups = db.collection('rounds').doc(r.toString()).collection('matchups');
	
	let snapshot = await matchups.get();

	snapshot.docs.forEach(d => {
		console.log(d);
	});

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