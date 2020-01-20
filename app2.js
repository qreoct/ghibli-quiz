var ghibliURL = 'https://ghibliapi.herokuapp.com/'

const sendbtn = document.getElementById("send")
const clearbtn = document.getElementById("clear")
var difficulties = document.getElementsByName("options")

sendbtn.addEventListener("click", generateQuiz)
clearbtn.addEventListener("click", clearHTML)

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
			var topics = ['films', 'people', 'species'];
			break;
		default :
			break;
	}
	var topic = topics[getRandom(0,topics.length)]
	switch(topic){
		case 'films':
			var objname = 'title'
			switch(difficulty){
				case 'easy':
					var focuses = ["description"]
				break;
				case 'difficult':
					var focuses = ["release_date", "director"]
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
					var focuses = ["eye_color", "hair_color"]
				break;
			}
			break;
		case 'species':
			var objname = 'name'
			var focuses = ['name']
			break;
	}
	var focus = focuses[getRandom(0,focuses.length)]

	/* so now we have
	objname: Ponyo / Cat
	topic: Films / Species
	focus: Description / Films
	*/
    setQn(difficulty.value, topic, focus, objname, createEventListeners)
    document.getElementById('qn').innerHTML = ""
    document.getElementById('ans').innerHTML = ""


	// checking answer code
	function createEventListeners(){
		document.getElementById("ans").onclick = handler
	}

	function handler(event){
		console.log('currtarget', event.currentTarget)
		console.log('evaluating answer... topic was ', topic)
		checkAns(event.target.innerHTML, objname, topic, focus)
	}

	function checkAns(attempt, name, topic, focus){
		var ansID = qnArray[0].id
		queryAPI(topic+'/'+ansID, (res) => {
			console.log('response of query is', res)
			console.log('correct ans...', res[focus])
			console.log('attempt was...', attempt)
			if (res[focus].substring(0,100) === attempt.substring(0,100)){
				answered = true;
				alert('correct!');
			}else{
				answered = true;
				alert('wrong!');
			}


		})
	}

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
	/* qns is an array of 

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

	// get and draw qn
	queryAPI(topic, (result) => {
		qn = getRandQn(result)
		console.log(qn)
		drawQn(qn)
		addQn(qn)
		addAns(qn.ans)

		var qn2 = qn3 = qn
		while (qn2.ans == qn.ans) {
			console.log('rolling new qn2... got')
			qn2 = getRandQn(result)
			console.log(qn2.ans)
		}
		while (qn3.ans == qn.ans || qn3.ans == qn2.ans) {
			console.log('rolling new qn3... got')
			qn3 = getRandQn(result)
			console.log(qn3.ans)
		}
		addAns( qn2.ans )
		addAns( qn3.ans )
		shuffle(ansArray)
		ansArray.forEach(ans => {
			drawAns(ans)
		})
		cb()
	});


	function addAns(ans){
		ansArray.push(ans)
	}
}


function queryAPI(query, cb) {
	console.log('query is', query)
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
	cardtext.textContent = "What is the " + qn.focus + " of " + qn.name + "?"

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
	ans.length > 50 ? text = ans.substring(0,100)+'...': text = ans
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

