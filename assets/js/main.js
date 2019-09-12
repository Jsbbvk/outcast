
var isOutcast = false;

var topic;
var category;

var qStr = "", aStr = "";

const QUESTION = 0;
const ANSWER = 1;
const DISPLAYP = 2;
var state = QUESTION;

var roomID = "";
var nameID = "";
var playerName = "";

socket.on('display current view', function(gamestart) {
    if (gamestart) {
        socket.removeAllListeners("change num player ready");
        socket.removeAllListeners("players finished");
        socket.removeAllListeners("player asked");
        socket.removeAllListeners("player answered");
        socket.removeAllListeners("game start");
        socket.removeAllListeners("question asked");
        socket.removeAllListeners("display players");

        $('#playerScreen').css('display','block');
        socket.emit('get room info', roomID, function(rm) {
            if (isOutcast && rm.fakeTopic==topic || !isOutcast&&rm.topic==topic) {
                initScoreboard();
                switch(state) {
                    case QUESTION:
                        displayQuestionDisplay();
                        break;
                    case ANSWER:
                        resetQuestionInputs();
                        displayAnswerDisplay();
                        break;
                    case DISPLAYP:
                        displayPQA();
                        break;
                }
            } else {
                $('#playerDisplay').css('display', 'none');
                $('#endGameButton').css('display', 'none');
                $('#answerQuestion').css('display','none');
                $('#waiting-room').css('display','none');
                $('#displayPlayersButton').css('display','none');
                initScoreboard();
                displayQuestionDisplay();
            }
        });
    } else {
        socket.removeAllListeners('game ended');
        socket.removeAllListeners("change num player ready");
        socket.removeAllListeners("players finished");
        socket.removeAllListeners("player asked");
        socket.removeAllListeners("player answered");
        socket.removeAllListeners("game start");
        socket.removeAllListeners("question asked");
        socket.removeAllListeners("display players");

        $('#playerScreen').css('display','none');
        $('#playerDisplay').css('display', 'none');
        $('#askQuestionDisplay').css('display', 'none');
        $('#endGameButton').css('display', 'none');
        $('#displayPlayersButton').css('display','none');
        qStr = "", aStr = "", topic = "", category = "";
        isOutcast = false;
        $('#waiting-room').css('display', 'block');
        displayWaitingRoom();

    }
});


var menuActive = false;
$('#toggleMenuButton').on('click', function(e) {
    e.preventDefault();
    menuActive = !menuActive;
    if (menuActive) {
        $("#menu").removeClass('mSlideUp');
        $("#menu").addClass('mSlideDown');
        document.getElementById('toggleMenuButton').innerHTML = '<i class="fas fa-sort-up"></i>';
        $(this).css('top', '-3%');
    } else {
        $("#menu").removeClass('mSlideDown');
        $("#menu").addClass('mSlideUp');
        document.getElementById('toggleMenuButton').innerHTML = '<i class="fas fa-sort-down"></i>';
        $(this).css('top', '100%');
    }
});

function initScoreboard() {
    menuActive = false;
    $('#menu').css('display','block');
    $('#toggleMenuButton').css('top', '100%');
    document.getElementById('toggleMenuButton').innerHTML = '<i class="fas fa-sort-down"></i>';
    $("#menu").removeClass('mSlideUp mSlideDown');

    socket.emit('get players', roomID, function(pl) {
        var s = "";
        for (var p of pl) {
            s += "<div class=\"text-center\"><h5>"+p.name+ ((p.id==nameID)?" (You)":"")+
                "</h5></div>";
        }
        document.getElementById('scoreboard').innerHTML = s;
    });
}


function displayQuestionDisplay() {
    state = QUESTION;
    resetQuestionInputs();

    initScoreboard();
    $("#end-game-button").unbind().on("click", endGame);
    $("#leave-game-button").unbind().on('click', leaveGame);

    $('#askQuestion').css('display', 'block');

    $('#question').on('input', function() {
        var qVal = document.getElementById("question").value;
        if (qVal.toLowerCase().includes(topic.toLowerCase())) {
            $('#questionWrong').text("Can't have " + topic + " in question");
            $('#questionWrong').css('display', 'block');
            $('#askQButton').fadeOut(600);
            return;
        } else {
            $('#questionWrong').css('display', 'none');
        }

        if ($(this).val() == "") {
            $('#askQButton').fadeOut(600);
        } else {
            $('#askQButton').fadeIn(600);
        }
    });
    $('#askQButton').on('click', function(e) {
        e.preventDefault();

        if ($('#question').val() == "") return;
        var qVal = document.getElementById("question").value;
        if (qVal.toLowerCase().includes(topic.toLowerCase())) {
            $('#questionWrong').text("Can't have " + topic + " in question");
            $('#questionWrong').css('display', 'block');
            return;
        }
        if (qVal.charAt(qVal.length-1)!= '?') {
            $('#questionWrong').text("End question with Question Mark '?'");
            $('#questionWrong').css('display', 'block');
            $('#askQButton').fadeOut(600);
            return;
        }
        $(this).off('click');
        console.log("Question: " + qVal);
        qStr = qVal;

        socket.emit('set question', roomID, nameID, qVal, function() {
            displayAnswerDisplay();
        });

    });


    state = QUESTION;

    socket.emit('get room info', roomID, function(rm) {
        if (rm.outcastID == nameID) isOutcast = true;
        if (isOutcast) topic = rm.fakeTopic;
        else topic = rm.topic;
        category = rm.category;
        $('#categoryText').text(rm.category);
        $('#topicText').text(((isOutcast)?rm.fakeTopic:rm.topic));
        $('#askQuestionDisplay').fadeIn(600, function() {

        });
    });

}

function resetQuestionInputs() {
    $('#answerQuestion').css('display', 'none');
    $('#answer').val("");
    $('#answerWrong').text("");
    $('#answerQButton').css('display', 'none');


    $('#askQuestion').css('display', 'none');
    $('#question').val("");
    $('#questionWrong').text("");
    $('#askQButton').css('display', 'none');
}

function displayAnswerDisplay() {
    state = ANSWER;
    $('#askQuestion').fadeOut(600, function(){
        socket.emit('get player info', roomID, nameID, function(pl) {
            $('#answerQuestionText').text(pl.questionPartner.question);
            if (pl.questionPartner.question == "Waiting...") {
                $('#answerQGroup').css('display', 'none');
            } else  $('#answerQGroup').css('display', 'block');

            $('#answerQuestion').fadeIn(600);
            socket.on('question asked', function(q) {
                $('#answerQuestionText').text(q);
                $('#answerQGroup').fadeIn(500);
            });
        });
    });

    $('#answer').on('input', function() {
        var qVal = document.getElementById("answer").value;
        if (qVal.toLowerCase().includes(topic.toLowerCase())) {
            $('#answerWrong').text("Can't have " + topic + " in answer");
            $('#answerWrong').css('display', 'block');
            $('#answerQButton').fadeOut(600);
            return;
        } else {
            $('#answerWrong').css('display', 'none');
        }

        if ($(this).val() == "") {
            $('#answerQButton').fadeOut(600);
        } else {
            $('#answerQButton').fadeIn(600);
        }
    });
    $('#answerQButton').on('click', function(e) {
        e.preventDefault();

        if ($('#answer').val() == "") return;
        var qVal = document.getElementById("answer").value;
        if (qVal.toLowerCase().includes(topic.toLowerCase())) {
            $('#answerWrong').text("Can't have " + topic + " in answer");
            $('#answerWrong').css('display', 'block');
            return;
        }
        /*
        if (qVal.charAt(qVal.length-1) != '.') {
            $('#answerWrong').text("End answer with Period '.'");
            $('#answerWrong').css('display', 'block');
            $('#answerQButton').fadeOut(600);
            return;
        }
        */
        $(this).off('click');

        console.log("Answer: " + qVal);
        aStr = qVal;
        socket.emit('set answer', roomID, nameID, qVal, function() {
            displayPQA();
        });
    });

}

function displayPQA() {
    if (infoVisible) {
        hideInfo();
    }
    $('#endGameButton').css('display', 'none');
    state = DISPLAYP;
    socket.removeAllListeners('player answered');
    socket.removeAllListeners('player asked');
    socket.removeAllListeners('question asked');

    $('#pDText').text('Questions');
    socket.emit('get room info', roomID, function(rm) {
        $('#playerCategory').text(rm.category);
        $('#playerTopic').text(rm.topic);
        if (isOutcast) {
            $('#playerFakeTopicH').css('display','block');
            $('#playerFakeTopic').text(rm.fakeTopic);
        }
        else $('#playerFakeTopicH').css('display','none');
    });

    socket.emit('get players', roomID, function(pl){

        var s = "";
        var sFirst = "";

        var allFinish = true;
        for (var p of pl) {
            if (p.answer =="Waiting...") allFinish = false;
            if (p.id==nameID) {
                $('#playerRole').text((p.isOutcast)?"the Outcast":"Not the Outcast");
                sFirst += "<div class=\"playerQA text-left\">" +
                    "<p class=\"pQ\" style=\"background:#e5c690\" id='pQ"+p.id+"'>"+p.name+" (You): "+p.question+"</p>" +
                    "<p class=\"pA\" style=\"background: #cdb181;\" id='pA"+p.answerPartner.id+"'>"+p.answerPartner.name+": " + p.answerPartner.answer+"</p></div>";
            } else if (p.answerPartner.id == nameID) {
                s += "<div class=\"playerQA text-left\">" +
                    "<p class=\"pQ\" id='pQ"+p.id+"'>[Hidden]: "+p.question+"</p>" +
                    "<p class=\"pA\" id='pA"+p.answerPartner.id+"' style=\"background: #e5c690;\">"+p.answerPartner.name+" (You): "+p.answerPartner.answer+"</p></div>";
            } else
                s += "<div class=\"playerQA text-left\">" +
                    "<p class=\"pQ\" id='pQ"+p.id+"'>[Hidden]: "+p.question+"</p>" +
                    "<p class=\"pA\" id='pA"+p.answerPartner.id+"'>[Hidden]: "+p.answerPartner.answer+"</p></div>";
        }
        document.getElementById("playersQDisplay").innerHTML = sFirst + s;

        $('#askQuestionDisplay').fadeOut(600, function() {
           $('#playerDisplay').fadeIn(600);
        });

        if (allFinish) {
            $('#displayPlayersButton').fadeIn(600, function(){
                $('#displayPlayersButton').unbind().on('click', function(e) {
                    e.preventDefault();
                    $('#displayPlayersButton').off('click');
                    socket.emit('ready for display players', roomID, nameID);
                    socket.on('change num player ready', function(numReady, tReady) {
                        $('#displayPlayersButton').text("Ready " + numReady+"/"+tReady);
                        $('#displayPlayersButton').css('background', '#62ee4c');
                    });
                });
            });
        }
    });


    socket.on('player answered', function(pl) {
        console.log('Player answered: ' +pl.id);
        socket.emit('get player info', roomID, nameID, function(p) {
            $('#pA'+pl.id).fadeOut(600, function(){
                $('#pA'+pl.id).text(((p.answerPartner.id==pl.id)?pl.name:"[Hidden]")+": " +pl.answer);
            }).fadeIn(600);
        });
    });

    socket.on('player asked', function(pl) {
        console.log("Player asked: " + pl.id);
        $('#pQ'+pl.id).fadeOut(600, function(){
            $('#pQ'+pl.id).text(((pl.id==nameID)?playerName+" (You): ": "[Hidden]: ") +pl.question);
        }).fadeIn(600);
    });

    socket.on('players finished', function() {
        $('#displayPlayersButton').fadeIn(600, function(){
           $('#displayPlayersButton').unbind().on('click', function(e) {
               e.preventDefault();
               $('#displayPlayersButton').off('click');
               socket.emit('ready for display players', roomID, nameID);
               socket.on('change num player ready', function(numReady, tReady) {
                   $('#displayPlayersButton').text("Ready " + numReady+"/"+tReady);
                   $('#displayPlayersButton').css('background', '#62ee4c');
               });
           });
        });
    });

    socket.on('display players', function(){
        displayResults();
    });

    socket.emit('ready display players', roomID, function(res) {
        if(res) displayResults();
    });
}


function displayResults() {
    socket.removeAllListeners("change num player ready");
    socket.removeAllListeners("players finished");
    socket.removeAllListeners("player asked");
    socket.removeAllListeners("player answered");

    $('#displayPlayersButton').fadeOut(600, function(){
        $('#displayPlayersButton').text("Next Round?");
        $('#displayPlayersButton').css('background', '#c1ffb7');
    });

    $('#pDText').fadeOut(600, function(){
        $('#pDText').text("Results");
    }).fadeIn(600);

    socket.emit('get players', roomID, function(pl) {
        $('#playersQDisplay').fadeOut(600, function() {
            var s = "";
            for (var p of pl) {
                if (p.isOutcast) {
                    s += "<div class=\"playerQA text-left\">" +
                        "<p class=\"pQ\" style=\"background:#e5c690\" id='pQ"+p.id+"'><span style='font-size:0.8em; color:red;'>Outcast</span><br>"+p.name+((p.id==nameID)?" (You)":"")+
                        ": "+p.question+"</p>" +
                        "<p class=\"pA\" id='pA"+p.answerPartner.id+"'>"+p.answerPartner.name+((p.answerPartner.id==nameID)?" (You)":"")+
                        ": " + p.answerPartner.answer+"</p></div>";
                } else if (p.answerPartner.isOutcast) {
                    s += "<div class=\"playerQA text-left\">" +
                        "<p class=\"pQ\" id='pQ"+p.id+"'>"+p.name+((p.id==nameID)?" (You)":"")+
                        ": "+p.question+"</p>" +
                        "<p class=\"pA\" style=\"background:#e5c690\" id='pA"+p.answerPartner.id+"'><span style='font-size:0.8em; color:red;'>Outcast</span><br>"+
                        p.answerPartner.name+((p.answerPartner.id==nameID)?" (You)":"")+": " + p.answerPartner.answer+"</p></div>";
                }
                else
                    s += "<div class=\"playerQA text-left\">" +
                        "<p class=\"pQ\" id='pQ"+p.id+"'>"+p.name+((p.id==nameID)?" (You)":"")+": "+p.question+"</p>" +
                        "<p class=\"pA\" id='pA"+p.answerPartner.id+"'>"+p.answerPartner.name+((p.answerPartner.id==nameID)?" (You)":"")+
                        ": "+p.answerPartner.answer+"</p></div>";
            }
            document.getElementById("playersQDisplay").innerHTML = s;
        }).fadeIn(600, function() {
            $('#endGameButton').fadeIn(600, function(){
                $(this).on('click', function() {
                    $(this).off('click');
                    socket.emit('end game', roomID);
                });
            });
        });
    });

}












var infoVisible = false;

$("#playerDisplay_information").dblclick(function(e) {
    e.preventDefault();
    hideInfo();
});


var lastTap = 0;
$("#playerDisplay_information").on("touchend", function(e) {
    var currentTime = new Date().getTime();
    var tapLength = currentTime - lastTap;

    e.preventDefault();
    lastTap = currentTime;
    if(tapLength < 500 && tapLength > 0){
        //Double Tap/Click
        hideInfo();
    }
});



function hideInfo() {
    infoVisible = !infoVisible;
    document.getElementById("playerDisplay_information_text").innerText = (infoVisible)?"Double click to hide":"Double click to show";
    if (infoVisible) {
        $('#playerDisplay_information_div').css('display', 'block');
        $('#playerDisplay_information_hidden').css('display', 'none');
    } else {
        $('#playerDisplay_information_div').css('display', 'none');
        $('#playerDisplay_information_hidden').css('display', 'block');
    }
}

