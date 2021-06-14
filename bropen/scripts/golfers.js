const loadGolfers = async() => {
    let golfers = await db.collection('golfers');
}

const populateGolfers = async() => {
    
    
    populateGolfersForAdmin();
    populateGolfersForIndex();
}

const populateGolfersForAdmin = async () => {
    $("#current_golfers").html("");
    let allGolfers = await retrieveGolfers();
	j = 0;

	if(allGolfers.length != 0) {

		golfersHtml = "";
		golfersHtml += "<table class='table'>";
		golfersHtml += "<tr>";
		golfersHtml += "<th>Name</th>"
		golfersHtml += "<th>Team</th>"
		golfersHtml += "<th>Scorecard Name</th>"
		golfersHtml += "<th></th>"
		golfersHtml += "</tr>";
		
		allGolfers[allGolfers.length - 1].then(golfersArr => {
			golfersArr.forEach(golfer => {
				console.log(golfer);
				
				golfersHtml += "<tr>";
				golfersHtml += "<td>" + golfer.name + "</td>";
				golfersHtml += "<td>" + golfer.team + "</td>";
				golfersHtml += "<td>" + golfer.scorecardName + "</td>";
				golfersHtml += "<td><button class='btn btn-danger btn-sml' onClick=deleteGolfer(\"" + golfer.id + "\")>Delete Golfer</button></td>";
				golfersHtml += "</tr>";
			});
			golfersHtml += "</table>";

			$("#current_golfers").html(golfersHtml);
		});
	} else {
		$("#current_golfers").html("");
	}
}

const populateGolfersForIndex = async () => {
    $("#golfers").html("");
    let allGolfers = await retrieveGolfers();
	j = 0;

	if(allGolfers.length != 0) {

		golfersHtml = "<h5>Golfers</h5>";
		golfersHtml += "<table class='table center'>";
		golfersHtml += "<tr>";
		golfersHtml += "<th>Name</th>"
		golfersHtml += "<th>Team</th>"
		golfersHtml += "<th></th>"
		golfersHtml += "</tr>";
		
		allGolfers[allGolfers.length - 1].then(async(golfersArr) => {
			golfersArr.forEach(async(golfer) => {
				golfersHtml += "<tr bgcolor='" + (golfer.team == "red" ? "#FF8A8A" : "#00DCFF") + "'>";
				golfersHtml += "<td>" + golfer.name + "</td>";
				golfersHtml += "<td>" + golfer.team + "</td>";
				golfersHtml += "</tr>";
			});
			golfersHtml += "</table>";

			$("#golfers").html(golfersHtml);
		});
	} else {
		$("#golfers").html("");
	}
}

const retrieveGolfers = async () => {
	return new Promise(async function(resolve, reject) {
		resolve(fetchGolfers());
	})
}

const fetchGolfers = async () => {
	let golfers = await db.collection('golfers');
	
	let snapshot = await golfers.get();

	let finalGolfers = await snapshot.docs.map(async(d) => {

		let g = golfers.doc(d.id).get();
		golfersArr = [];
		await g.then(r => {
			golfersArr.push(new Golfer(d.id, r.data().name, r.data().team, r.data().scorecardName))
		})
		
		return golfersArr;
	})

	return await finalGolfers;

}

const deleteGolfer = async (id) => {
	
	const res = await db.collection('golfers').doc(id).delete();
	
	populateGolfers();
}