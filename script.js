var currentQuestion = 0;
var score = 0;
var askedQuestions = [];
var playerName = "";
var highscores = JSON.parse(localStorage.getItem('highscores')) || [];
var questions = [];

function startQuiz() {
    var startPanel = document.getElementById("start-panel");
    var quizPanel = document.getElementById("quiz-panel"); 
    playerName = document.getElementById("player-name").value;

    if (!playerName) {
        alert("Podaj swoje imię przed rozpoczęciem quizu!");
        return;
    }
    
    startPanel.classList.remove("show");
    quizPanel.classList.add("show");
    loadQuestions();
}

function loadQuestions() {
    fetch('questions.json')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            questions = data;
            loadQuestion();
        })
        .catch(error => console.error('Error loading questions:', error));
}

function loadQuestion() {
    var quizContainer = document.getElementById("quiz");
    var resultPanel = document.getElementById("result-panel");
    questions = Shuffle(questions);

    if (askedQuestions.length === questions.length) {
        showResult();
        return;
    }
    
   
    var notAskedQuestions = questions.filter(function (q) {
        return askedQuestions.indexOf(q) === -1;
    });
    
    var currentQ = notAskedQuestions[0];
    askedQuestions.push(currentQ);
    var shuffledOptions = Shuffle(currentQ.options);
  
    quizContainer.innerHTML = "<h2>" + currentQ.question + "</h2>";
    for (var i = 0; i < shuffledOptions.length; i++) {
        quizContainer.innerHTML += '<button class="option-button" onclick="selectAnswer(this)" data-answer="' + shuffledOptions[i] + '">' + shuffledOptions[i] + '</button>';
    }
    
    resultPanel.classList.add("hide");
}

function Shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function selectAnswer(button) {
    var selectedAnswer = button.getAttribute("data-answer");
    var currentQ = askedQuestions[askedQuestions.length - 1];

    if (selectedAnswer === currentQ.correctAnswer) {
        score++;
    }
    
    var answerButtons = document.querySelectorAll('.option-button');
    answerButtons.forEach(function (btn) {
        btn.disabled = true;
    });
    
    highlightAnswer(button, selectedAnswer === currentQ.correctAnswer ? "green" : "red");
  
    setTimeout(function () {
       
        resetAnswerColors();
        currentQuestion++;
        if (currentQuestion < questions.length) {
            loadQuestion();
        } else {
            showResult();
        }
    }, 1500);
}

function highlightAnswer(button, color) {
    button.style.backgroundColor = color;
}

function resetAnswerColors() {
    var buttons = document.querySelectorAll('.option-button');
    buttons.forEach(function (button) {
        button.style.backgroundColor = "";
    });
}

function showResult() {
    var quizPanel = document.getElementById("quiz-panel"); 
    var resultPanel = document.getElementById("result-panel");
    var resultContainer = document.getElementById("result");
    quizPanel.classList.remove("show");
    resultPanel.classList.add("show");
   
    var playerResult = getResultDescription(); 
    resultContainer.innerHTML = playerResult + "<br/>" + "Twój wynik to: " + score + " z " + questions.length;
    
    highscores.push({ name: playerName, score: score });
    
    localStorage.setItem('highscores', JSON.stringify(highscores));
    var playAgainButton = document.getElementById("play-again-button"); 
    resultPanel.style.fontSize = "25px";
    playAgainButton.style.marginTop = "20px";
    playAgainButton.style.marginBottom = "20px";
    showHighscores();
}

function getResultDescription() {
    if (score <= 3) {
        return "Nieźle się starałeś, ale warto jeszcze poczytać.";
    } else if (score >= 4 && score <= 7) {
        return "Dobra robota! Masz już sporo wiedzy.";
    } else if (score >= 8) {
        return "Fantastycznie! Jesteś prawdziwym ekspertem!";
    }
}

function playAgain() {
    var startPanel = document.getElementById("start-panel");
    var quizPanel = document.getElementById("quiz-panel"); 
    var resultPanel = document.getElementById("result-panel");
    startPanel.classList.add("show");
    quizPanel.classList.remove("show");
    resultPanel.classList.remove("show");
    currentQuestion = 0;
    score = 0;
    askedQuestions = [];
    playerName = "";
}

function saveScoreToLocalStorage(playerName, playerScore) {
 
    var highscores = JSON.parse(localStorage.getItem("highscores")) || [];
    highscores.push({
        name: playerName,
        score: playerScore
    });
  
    localStorage.setItem("highscores", JSON.stringify(highscores));
}

function showHighscores() {
    var highscorePanel = document.getElementById("highscore-panel");
    var existingTable = document.getElementById("highscore-table");
    if (existingTable) {
        highscorePanel.removeChild(existingTable);
    }
    highscores.sort(function (a, b) {
        return b.score - a.score;
    });
    var table = document.createElement("table");
    table.setAttribute("id", "highscore-table");
    table.classList.add("highscore-table");
    var thead = table.createTHead();
    var row = thead.insertRow();
    var nameHeader = row.insertCell(0);
    var scoreHeader = row.insertCell(1);
    nameHeader.innerHTML = "<b>Imię</b>";
    scoreHeader.innerHTML = "<b>Wynik</b>";
    var tbody = table.createTBody();
    for (var i = 0; i < highscores.length; i++) {
        var highscore = highscores[i];
        var row = tbody.insertRow();
        var nameCell = row.insertCell(0);
        var scoreCell = row.insertCell(1);
        nameCell.innerHTML = highscore.name;
        scoreCell.innerHTML = highscore.score;
    }
    highscorePanel.appendChild(table);
    highscorePanel.style.display = "block";
}

window.addEventListener('beforeunload', function () {
    localStorage.clear();
});