const loadScoreboard = async () => {
    let rounds = await db.collection('rounds');

	let snapshot = await rounds.get();

    if(snapshot.size != 0) {
        for (i = 1; i <= snapshot.size; i++) {
            console.log(i);
        }
    } else {
        
    }

    

}