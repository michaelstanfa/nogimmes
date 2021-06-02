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

function Golfer(id, name, team) {
	this.id = id;
	this.name = name;
	this.team = team;
}

let currentRoundForAddingMatchup;

const addGolfer = async(name, team) => {

	username = name.toLowerCase().replace(/[^A-Za-z]/g, "");

	if(!name) {
		alert('Please enter a name');
	} else {
	 	let golfers = await db.collection('golfers');

		const golfer = {
			name: name,
			team: team
		}
		
		await golfers.doc(username).set(golfer);
	
	}
	
	populateGolfers();

}

const retrieveMatchups = async () => {
	return new Promise(async function(resolve, reject){
		resolve(setupAllMatchups());
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

	let header = "<table class = 'table'><tr><th>#</th><th>Blue Team</th><th>Red Team</th></tr>";

	let body = "";

	let matchups = await retrieveMatchups();

	i = 0;
	matchups[matchups.length - 1].then(matchupArr => {
		matchupArr.forEach(matchup => {
			i++;
			
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

const addRound = async () => {
	let rounds = await db.collection('rounds');

	let snapshot = await rounds.get();
	
	let data = {
		scoring: $("#round_scoring_type").val(),
		style: $("#round_style").val(),
		playersPerTeam: $("#round_matchup_team_player_count").val(),
	}

	rounds.doc((snapshot.size + 1).toString()).set(data);

	populateAdminRounds();

}

const displayAdminRound = async (roundId) => {

	let round = await db.collection('rounds').doc(roundId.toString());

	let snapshot = await round.get();

	let data = await snapshot.data();

	$("#add_new_matchups").attr('hidden', false);

	$(".round_number").html("<h3>Round " + snapshot.id +"</h3>" + data.style.replace("_", " ") + " | " + data.scoring.replace("_", " ") + " | " + data.playersPerTeam + " players per team");

	// let roundInfoHTML = "";
	// roundInfoHTML= "<table class ='table'>"
	// roundInfoHTML+= "<tr>"
	// roundInfoHTML+= "<td>Style</td>"
	// roundInfoHTML+= "<td>Scoring</td>"
	// roundInfoHTML+= "<td>Players Per Team</td>"
	// roundInfoHTML+= "</tr>"

	// roundInfoHTML+= "<tr>"
	// roundInfoHTML+= "<td>" + data.style + "</td>"
	// roundInfoHTML+= "<td>" + data.scoring + "</td>"
	// roundInfoHTML+= "<td>" + data.playersPerTeam + "</td>"
	// roundInfoHTML+= "</tr>"
	// roundInfoHTML+= "</table>"

	// $("#round_information").html(roundInfoHTML);

	displayRoundMatchupForAdmin(snapshot.id, data);
	populateAddMatchupDropdowns(snapshot.id, data.playersPerTeam);
	
}

const displayRoundMatchupForAdmin = async (round) => {

	$("#current_round_matchups").html("");
	
	let matchups = await db.collection('rounds').doc(round).collection('matchups');

	let snapshot = await matchups.get();


	let html = "<table class = 'table'>"
	html += "<tr><th>Red</th><th>Blue</th></tr>"

	await snapshot.docs.forEach(async(d) => {

		html += 
			"<tr>" +
				"<td>" + d.data().red.team.toString().replace(",", " & ") + "</td>" +
				"<td>" + d.data().blue.team.toString().replace(",", " & ") + "</td>" +
				"<td>" + "<button class='btn btn-danger' onClick='removeGroupingFromRound(\"" + d.id + "\"," + round + ")'>Remove Group</button>" + "</td>" +
			"</tr>"
	})

	$("#current_round_matchups").html(html);

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

	updateData = {
		red: {
			team: redPlayers,
			score: 0
		},
		blue: {
			team: bluePlayers,
			score: 0
		}
	}

	let matchups = await db.collection('rounds').doc(currentRoundForAddingMatchup.toString()).collection('matchups')

	let matchupSize = await matchups.get().then(shard => {
		return shard.size;
	});
	
	await matchups.doc().set(updateData);

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

const setupAllMatchups = async function(req, res) {

	return await generateMatchups();

}


const generateMatchups = async () => {
	
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