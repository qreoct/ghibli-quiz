var request = new XMLHttpRequest()
var ghibliURL = 'https://ghibliapi.herokuapp.com/'

const sendbtn = document.getElementById("send")
const clearbtn = document.getElementById("clear")
var difficulties = document.getElementsByName("options")

sendbtn.addEventListener("click", getData)
clearbtn.addEventListener("click", clearHTML)

function getData() {
    var difficulty = document.querySelector('[name="options"]:checked');
    queryAPI(difficulty.value)
    document.getElementById('qn').innerHTML = ""
    document.getElementById('ans').innerHTML = ""

}

function queryAPI(difficulty){
	console.log('difficulty is', difficulty)
	switch(difficulty){
		case 'easy': 
			queries = ['films', 'people'];
			break;
		case 'difficult': 
			queries = ['people'];
			break;
		default :
			break;
	}

	const query = queries[getRandom(0,queries.length)]
	console.log('query is', query)
	request.open('GET', 'https://ghibliapi.herokuapp.com/' + query, true)
	request.onload = function() {
		// get the response in data variable
		var data = JSON.parse(this.response)
	  	console.log(data.length)
	  	var rndnum = getRandom(0,data.length)
	  	console.log(rndnum)
	  	var qn = generateQn(query, data[rndnum], difficulty, [data[getRandom(0,data.length)], data[getRandom(0,data.length)]])

		if (request.status >= 200 && request.status < 400) {
			drawQn(qn)

			var answer_options = document.getElementsByName("anstext")
			answer_options.addEventListener("click", alert(answer_options))

		} else {
			alert("Error! Please try again. Error code:", request.status)
		}
	}
	request.send()
}

function generateQn(topic, data, difficulty, poss_answers){
	console.log('topic:', topic)
	console.log('data:', data)

	switch(topic){
		case 'films':
			var objname = data.title
			switch(difficulty){
				case 'easy':
					options = ["description"]
				break;
				case 'difficult':
					options = ["release_date"]
				break;
			}
			break;
		case 'people':
			var objname = data.name
			switch(difficulty){
				case 'easy':
					options = ["age", "gender"]
				break;
				case 'difficult':
					options = ["eye_color"]
				break;
			}
	}
	choice = getRandom(0, options.length)
	var question = {
		name: objname,
		id: data.id,
		subject: options[choice],
		ans: data[options[choice]],
		poss_options: [poss_answers[0][options[choice]], poss_answers[1][options[choice]]]
	}
	return question
}


function drawQn(qn){
	var canvas = document.getElementById("qn")

	var qncard = document.createElement('div')

	var cardtitle = document.createElement('h6')
	cardtitle.setAttribute('class', 'card-title')

	var cardtext = document.createElement('p')
	cardtext.setAttribute('class','card-text')

	cardtitle.textContent = qn.name
	cardtext.textContent = "What is the " + qn.subject + " of " + qn.name + "?"

	canvas.appendChild(qncard)
	qncard.appendChild(cardtitle)
	qncard.appendChild(cardtext)


	answers = [qn.ans, qn.poss_options[1], qn.poss_options[0]]
	shuffle(answers)
	answers.forEach(ans => drawAns(ans))
	console.log(answers)

}

function drawAns(ans){
	var canvas = document.getElementById("ans")
	var anscard = document.createElement('div')
	anscard.setAttribute('class', 'card col')
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
	document.getElementById('content').innerHTML = ""
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