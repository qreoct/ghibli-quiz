var ghibliURL = 'https://ghibliapi.herokuapp.com/'

const sendbtn = document.getElementById("send")
const clearbtn = document.getElementById("clear")
var difficulties = document.getElementsByName("options")

sendbtn.addEventListener("click", generateQuiz)
clearbtn.addEventListener("click", clearHTML)

var score = 0
var streak = 0
var beststreak = 0
var scorecounter = document.getElementById("score_val")
var curr_streak_counter = document.getElementById("curr_streak")
var best_streak_counter = document.getElementById("best_streak")

var qnArray = [];

function generateQuiz() {
	//generate topic and difficulty
	var answered = false;
    var difficulty = document.querySelector('[name="options"]:checked').value;
    var topic = "";
    var focus = "";
    switch(difficulty){
		case 'easy': 
			var topics = ['films', 'people'];
			break;
		case 'difficult': 
			var topics = ['films', 'people', 'species', 'locations', 'vehicles'];
			break;
		default :
			break;
	}
	var topic = topics[getRandom(0,topics.length)]
	// setting question types!
	switch(topic){
		case 'films':
			var objname = 'title'
			switch(difficulty){
				case 'easy':
					var focuses = ["description", "director"]
				break;
				case 'difficult':
					var focuses = ["release_date", "producer"]
				break;
			}
			break;
		case 'people':
			var objname = 'name'
			switch(difficulty){
				case 'easy':
					var focuses = ["age", "gender"]
				break;
				case 'difficult':
					var focuses = ["eye_color", "hair_color", "species", "films"]
				break;
			}
			break;
		case 'species':
			var objname = 'name'
			var focuses = ['people']
			break;
		case 'vehicles':
			var objname = 'name'
			var focuses = ['description', 'films']
			break;
		case 'locations':
			var objname = 'name'
			var focuses = ['films']
			break;
	}
	var focus = focuses[getRandom(0,focuses.length)]

	/* so now we have
	objname: Ponyo / Cat / The Cat Kingdom
	topic: Films / Species / Locations
	focus: Description / Name / Films
	*/
	console.log('setting qn...')
    setQn(difficulty.value, topic, focus, objname, createEventListeners)
    document.getElementById('qn').innerHTML = ""
    document.getElementById('ans').innerHTML = ""


	// checking answer code
	function createEventListeners(){
		document.getElementById("ans").onclick = handler
	}

	function handler(event){
		console.log('currtarget', event.currentTarget)
		console.log('evaluating answer... topic was', topic)


		if (qn.ans.toString().substring(0,4) == 'http'){
			if (typeof qn.ans === 'object'){
				console.log ('=== should be 1 link:',qn.ans[0])
				var tobeCleaned = qn.ans[0]
			}else{
				var tobeCleaned = qn.ans
			}
			CleanURL(tobeCleaned, (res) => {
				if (res.title) {
					checkAns(event.target.innerHTML, objname, topic, focus, difficulty, res.title)
				} else {
					checkAns(event.target.innerHTML, objname, topic, focus, difficulty, res.name)

				}
			});
		}else{
			checkAns(event.target.innerHTML, objname, topic, focus, difficulty, qn.ans)
		}
	}

	function checkAns(attempt, name, topic, focus, difficulty, ans){
		console.log('checkans answer is ', ans)
		console.log('attempt was...', attempt)
		if (ans.substring(0,20) === attempt.substring(0,20)){
			answered = true;
			var mod;
			if (difficulty == 'easy'){
				mod = 2;
			}else{
				mod = 5;
			}
			streak += 1
			if (streak > beststreak){
				beststreak = streak
			}
			curr_streak_counter.innerHTML = streak
			best_streak_counter.innerHTML = beststreak
			showToast('correct',mod)
			generateQuiz()
		}else{
			answered = true;
			if (difficulty == 'easy'){
				mod = -3
			}else{
				mod = -7
			}
			streak = 0
			curr_streak_counter.innerHTML = streak
			best_streak_counter.innerHTML = beststreak
			showToast('wrong',mod)
		}

	}
}

function showToast(r,mod){
	// show Toast and change score!
	if (r == 'correct'){
		$("#toast_correct").toast('show');
			$(".toast-body").html('Score +' + mod)
			score+=mod
			score_val.innerHTML = score
	} else {
		$("#toast_wrong").toast('show');
			$(".toast-body").html('Score ' + mod)
			score+=mod
			score_val.innerHTML = score
	}
}
function CleanURL(qry, cb){
	qry = qry.toString().substring(32,)
	console.log('CleanURL running! query:', qry)

	queryAPI(qry, (data) => {
		console.log('CleanURL Query responded with',data)
		cb(data)
	});
}

function setQn(difficulty, topic, focus, objname, cb){
	var ansArray = []
	/* qn is an object in the form
		name: Ponyo
		id: sdfl-124d-gjk2-jf93
		topic: films
		focus: Description
		ans: 'Long description about the movie...'
	*/

	function getRandQn(qnslist) {
		//console.log("3: getqn stage")
		randomqn = qnslist[getRandom(0,qnslist.length)]

		var qn = {
			name: randomqn[objname],
			id: randomqn['id'],
			topic: topic,
			focus: focus,
			ans: randomqn[focus]
		}
		return qn
	}

	function addQn(qn){
		qnArray = [];
		qnArray.push(qn)
	}

	// get and draw qn, options
	queryAPI(topic, (result) => {
		qn = getRandQn(result)
		console.log(qn)
		drawQn(qn)
		addQn(qn)

		var qn2 = qn3 = qn
		while (qn2.ans == qn.ans) {
			console.log('rolling new qn2... got')
			qn2 = getRandQn(result)
		}
		while (qn3.ans == qn.ans || qn3.ans == qn2.ans) {
			console.log('rolling new qn3... got')
			qn3 = getRandQn(result)
		}

		//1. check if answers are links, then cleans them up if it is
		//2. after evaluating, THEN shuffle & print
		var anslist = [qn.ans, qn2.ans, qn3.ans]
		var count = 0
		function fixLinksInAns(answerList, cb){
			answerList.forEach(a =>{
					console.log('debug ans is',a, typeof(a))
					if (typeof a !== 'string'){ a = a[0] }
					console.log('debug ans is now', a)
					if (a.toString().substring(0,4) == 'http'){
					CleanURL(a.toString(), (res) => {
						console.log('debug ans', a)
						if(a[32] == 'f'){ 
							console.log('---- it`s a film!')
							addAns(res.title) 
						}
						else {
							console.log('---- it`s a people!')
							addAns(res.name)
						}
						count++;
						if (count === answerList.length) { cb(); }
					});
					} else {
						addAns(a)
						count++;
						if (count === answerList.length) { cb(); }
					}
			});
		}

		fixLinksInAns(anslist, ()=>{
			console.log('debug eval running now')
			shuffle(ansArray)
			ansArray.forEach(ans => {
				console.log('debug drawing',ans)
				drawAns(ans)
			})
		})
		cb()
	});


	function addAns(ans){
		console.log('debug ans added', ans)
		ansArray.push(ans)
	}
}


function queryAPI(query, cb) {
	console.log('queryAPI() running! query is', query)
	var request = new XMLHttpRequest()
	request.open('GET', 'https://ghibliapi.herokuapp.com/' + query, true)
	var receivedData;
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			receivedData = JSON.parse(this.response);
			console.log("1: response recv")
			cb(receivedData);
			request = null;
		} else {
			alert("Error! Please try again. Error code:", request.status)
		}
	}
	request.send()
}



function drawQn(qn){
	var canvas = document.getElementById("qn")

	var qncard = document.createElement('div')

	var cardtitle = document.createElement('h6')
	cardtitle.setAttribute('class', 'card-title')

	var cardtext = document.createElement('p')
	cardtext.setAttribute('class','card-text')

	cardtitle.textContent = qn.topic.toUpperCase()

	console.log('drawing qn!', 'name:',qn.name,'\ntopic:', qn.topic,'\nfocus:', qn.focus,'\nans:', qn.ans)
	
	qnW = ["What is the ", "Which of these ", "Which is the ", "Which of these ", "Who is the "]
	qnOp = [" of ", " with ", " are of the ", " has the ", " are for the ", " has "]
	qnEx = [" ", qn.topic + " "]

	//grammar bits
	if (qn.topic == 'vehicles' && qn.focus == 'films' ){
		// What is the films with the vehicle x?
		qnWord = qnW[0] // What is the
		qnOperator = qnOp[1] // with
		qnExtra =  qnEx[1] // vehicle
	}else if(qn.topic == 'films' && qn.focus == 'director' ){
		// Who is the director of film x?
		qnWord = qnW[4] // Who is the
		qnOperator = qnOp[0] // of
		qnExtra = qnEx[0] //
	}else if(qn.topic == 'locations' && qn.focus == 'films' ){
		// Which is the films with locations x?
		qnWord = qnW[1] // Which of these
		qnOperator = qnOp[3] // has the
		qnExtra = qnEx[1] // locations
	}else if(qn.topic == 'species' && qn.focus == 'people' ){
		// Which of these people are of the species Cat?
		qnWord = qnW[3] // Which of these
		qnOperator = qnOp[2] // are of the
		qnExtra = qnEx[1] // species
	}else if(qn.topic == 'vehicles' && qn.focus == 'description' ){
		// Which of these description are for the vehicle Red Wing?
		qnWord = qnW[3] // Which of these
		qnOperator = qnOp[4] // are for the
		qnExtra = qnEx[1] // vehicle
	}else if(qn.topic == 'people' && qn.focus == 'films' ){
		// Which of these films has Totoro?
		qnWord = qnW[3] // Which of these
		qnOperator = qnOp[5] // has
		qnExtra = qnEx[0] // 
	}else{
		//default
		qnWord = qnW[0]
		qnOperator = qnOp[0]
		qnExtra = qnEx[0]
	}
	cardtext.textContent = qnWord + qn.focus.split("_").join(" ") + qnOperator + qnExtra + qn.name + "?"

	canvas.appendChild(qncard)
	qncard.appendChild(cardtitle)
	qncard.appendChild(cardtext)

}

function drawAns(ans){
	var canvas = document.getElementById("ans")
	var anscard = document.createElement('div')
	anscard.setAttribute('class', 'card col border-left-gradient')
	anscard.setAttribute('id', 'anscard')
	anscard.setAttribute('style', 'width: 15rem;')
	var cardbody = document.createElement('div')
	cardbody.setAttribute('class', 'card-body')
	var anstext = document.createElement('a')
	anstext.href = "#"
	anstext.setAttribute('class','card-text stretched-link')
	anstext.setAttribute('name', 'anstext')
	ans.length > 50 ? text = ans.substring(0,60)+'...': text = ans
	anstext.textContent = text

	canvas.appendChild(anscard)
	anscard.appendChild(cardbody)
	cardbody.appendChild(anstext)


}

function clearHTML(){
	document.getElementById('content').innerHTML = `
	<div id="qn">
	</div>
	<div class="row" id="ans">
	</div> 
	`
}

function getRandom(min, max){
	return Math.floor(Math.random() * max);
}


function shuffle(a) {
// Fisher Yates shuffle algo for arrays
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

