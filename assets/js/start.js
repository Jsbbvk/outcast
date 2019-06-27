
var isLeaving = false;


socket.on('get room id', function(cb){
    cb&&cb(roomID);
});



// window.onbeforeunload = function() {
//     if (!isLeaving) socket.emit('delete player', roomID, nameID);
// };

window.onpagehide = function() {
    if (!isLeaving) socket.emit('delete player', roomID, nameID);
};


var categoryChoose = "Random";

$("#start-join-roomid").on({
    keydown: function(e) {
        if (e.which === 32)
            return false;
    },
    change: function() {
        this.value = this.value.replace(/\s/g, "");
    }
});
$("#start-create-roomid").on({
    keydown: function(e) {
        if (e.which === 32)
            return false;
    },
    change: function() {
        this.value = this.value.replace(/\s/g, "");
    }
});

var WrulesActive = false;
$("#waiting-rules").on("click", function(e) {
    e.preventDefault();
    WrulesActive = true;
    if (WrulesActive) {
        document.getElementById("waiting-rule-display").style.display = "block";
    }
});
$("#waiting-close-rule-display").on("click", function(e) {
    e.preventDefault();
    WrulesActive = false;
    if (!WrulesActive) {
        document.getElementById("waiting-rule-display").style.display = "none";
    }
});

var rulesActive = false;
$("#rules").on("click", function(e) {
    e.preventDefault();
    rulesActive = true;
    if (rulesActive) {
        document.getElementById("rule-display").style.display = "block";
    }
});
$("#close-rule-display").on("click", function(e) {
    e.preventDefault();
    rulesActive = false;
    if (!rulesActive) {
        document.getElementById("rule-display").style.display = "none";
    }
});

var optionsActive = false;
$("#waiting-setting").on('click', function (e) {
    e.preventDefault();
    optionsActive = true;
    document.getElementById("waiting-options").style.display = "block";
});
$("#waiting-options-close").on('click', function (e) {
    e.preventDefault();
    optionsActive = false;
    document.getElementById("waiting-options").style.display = "none";
    document.getElementById("option-pack").value = categoryChoose;
});
$("#option-cancel-button").on('click', function (e) {
    e.preventDefault();
    optionsActive = false;
    document.getElementById("waiting-options").style.display = "none";
    document.getElementById("option-pack").value = categoryChoose;
});
$("#option-save-button").on('click', function(e){
    e.preventDefault();
    var pk = document.getElementById("option-pack").value;

    socket.emit('update game category', roomID, pk);
    optionsActive = false;
    document.getElementById("waiting-options").style.display = "none";
});

var nameChangeActive = false;
$("#change-name-cancel-button").on("click", function(e) {
    e.preventDefault();
    nameChangeActive = false;
    document.getElementById("change-name").style.display = "none";
    document.getElementById("change-name-name").value = "";
});
$("#change-name-close").on('click', function (e) {
    e.preventDefault();
    nameChangeActive = false;
    document.getElementById("change-name").style.display = "none";
    document.getElementById("change-name-name").value = "";
});
$("#change-name-save-button").on('click', function (e) {
    e.preventDefault();
    var n = document.getElementById("change-name-name").value;
    document.getElementById("change-name-name").value = "";
    document.getElementById("change-name").style.display = "none";
    socket.emit('change player name', roomID, nameID, n);
});


document.getElementById("start-create-roomid").addEventListener('input', function (evt) {
    document.getElementById("start-create-error").innerText = "";

    if (this.value.length != 4) {
        this.style.border = "2px solid red";
    } else {
        this.style.border = "1px solid #e5cbb7";
    }
});
document.getElementById("start-join-roomid").addEventListener('input', function (evt) {
    document.getElementById("start-join-error").innerText = "";

    if (this.value.length != 4) {
        this.style.border = "2px solid red";
    } else {
        this.style.border = "1px solid #e5cbb7";
    }
});
document.getElementById("start-create-name").addEventListener('input', function (evt) {
    if (this.value.length == 0) {
        this.style.border = "2px solid red";
    } else {
        this.style.border = "1px solid #e5cbb7";
    }
});
document.getElementById("start-join-name").addEventListener('input', function (evt) {
    if (this.value.length == 0) {
        this.style.border = "2px solid red";
    } else {
        this.style.border = "1px solid #e5cbb7";
    }
});

function joinGameDisplay() {
    $("#start-join-game-button").unbind().click(joinGame);
    rulesActive = false;
    document.getElementById("rule-display").style.display = "none";

    document.getElementById("start-buttons").style.display = "none";
    document.getElementById("start-join-display").style.display = "block";
}

function createGameDisplay() {
    $("#start-create-game-button").unbind().click(createGame);
    rulesActive = false;
    document.getElementById("rule-display").style.display = "none";

    document.getElementById("start-buttons").style.display = "none";
    document.getElementById("start-create-display").style.display = "block";
}

function backToStart() {
    document.getElementById("start-join-display").style.display = "none";
    document.getElementById("start-create-display").style.display = "none";
    document.getElementById("start-join-roomid").value = "";
    document.getElementById("start-join-name").value = "";
    document.getElementById("start-create-roomid").value = "";
    document.getElementById("start-create-name").value = "";
    document.getElementById("start-buttons").style.display = "flex";
}

$("#start-join").click(joinGameDisplay);
$("#start-create").click(createGameDisplay);
$(".start-back-button").click(backToStart);





function startGame(e) {
    $("#startButton").off("click");

    setTimeout(function() {
        $("#startButton").on("click", startGame);
    }, 2000);
    socket.emit('start game', roomID);
}

function leaveGame(e) {
    e.preventDefault();
    socket.emit('delete player', roomID, nameID, function() {
        isLeaving = true;
        location.reload();
    });
}

function endGame(e) {
    socket.emit('end game', roomID);
}

var resetting = false;

socket.on('player leave', function(gamestart, id) {
    if (gamestart && !resetting) {
        //playing
        if (nameID > id) nameID--;
        resetting = true;

        $('#waiting-room').css('display', 'none');
        $('#playerScreen').fadeOut(800, function() {
            $('#playerLeaveNotification').fadeIn(2000, function() {
                socket.emit('end game', roomID);
                socket.removeAllListeners('game ended');
                socket.removeAllListeners("change num player ready");
                socket.removeAllListeners("players finished");
                socket.removeAllListeners("player asked");
                socket.removeAllListeners("player answered");
                socket.removeAllListeners("game start");
                socket.removeAllListeners("question asked");
                socket.removeAllListeners("display players");

                $('#playerDisplay').css('display', 'none');
                $('#askQuestionDisplay').css('display', 'none');
                $('#endGameButton').css('display', 'none');

                qStr = "", aStr = "", topic = "", category = "";
                isOutcast = false;
            }).fadeOut(800, function() {
                resetting = false;
                displayWaitingRoom();
                $('#waiting-room').fadeIn(800, function(){
                });
            });
        });

    } else {
        //waiting
        if (id==nameID) {
            isLeaving = true;
            location.reload();
        } else {
            if (nameID > id) nameID--;
            socket.emit("get players", roomID, function(p){
                displayPlayersInWaiting(p);
            });
        }
    }
});


function joinGame() {
    $("#start-join-game-button").off('click');
    setTimeout(function(){
        $("#start-join-game-button").on('click', joinGame);
    }, 2000);


    var room = document.getElementById("start-join-roomid").value;
    var n = document.getElementById("start-join-name").value;
    if (room.length < 4) {
        document.getElementById("start-join-roomid").style.border = "2px solid red";
        return
    } else if (n.length == 0) {
        document.getElementById("start-join-name").style.border = "2px solid red";
        return;
    }


    playerName = n;

    socket.emit("join room", room, n, function(res, numP) {
        if (res == "null") {
            //room does not exist
            document.getElementById("start-join-error").innerText = "Room does not exist";
            document.getElementById("start-join-roomid").style.border = "2px solid red";
        } else if (res=="started") {
            //game in session
            document.getElementById("start-join-error").innerText = "Game in session";
            document.getElementById("start-join-roomid").style.border = "2px solid red";
        } else if (res=="full") {
            //game full
            document.getElementById("start-join-error").innerText = "Room full";
            document.getElementById("start-join-roomid").style.border = "2px solid red";
        } else if (res=="success") {
            //joined successfully

            document.getElementById("start-join-roomid").value = "";
            document.getElementById("start-join-name").value = "";
            document.getElementById("start-join-display").style.display = "none";
            document.getElementById("start").style.display = "none";

            nameID = numP;
            roomID = room;
            displayWaitingRoom();
        }
    });
}

function createGame() {
    $("#start-create-game-button").off('click');
    setTimeout(function(){
        $("#start-create-game-button").on('click', createGame);
    }, 2000);
    var room = document.getElementById("start-create-roomid").value;
    var n = document.getElementById("start-create-name").value;
    if (room.length < 4) {
        document.getElementById("start-create-roomid").style.border = "2px solid red";
        return
    } else if (n.length == 0) {
        document.getElementById("start-create-name").style.border = "2px solid red";
        return;
    }
    playerName = n;
    socket.emit("create room", room, n, function(res) {
        if (res=="taken") {
            //room code already taken
            document.getElementById("start-create-error").innerText = "Room code taken";
            document.getElementById("start-create-roomid").style.border = "2px solid red";
        } else if (res == "success") {
            document.getElementById("start-create-roomid").value = "";
            document.getElementById("start-create-name").value = "";
            document.getElementById("start-create-display").style.display = "none";
            document.getElementById("start").style.display = "none";
            nameID = 1;
            roomID = room;
            console.log(nameID + " " + roomID);
            displayWaitingRoom();
        }
    });
}

function displayWaitingRoom() {
    document.getElementById("playerScreen").style.display = "none";

    $("#startButton").unbind().click(startGame);
    $("#leaveButton").unbind().click(leaveGame);
    optionsActive = false;

    document.getElementById("waiting-options").style.display = "none";

    document.getElementById("waiting-room").style.display = "block";
    document.getElementById("wait-roomCode").innerText = roomID;
    document.getElementById("waiting-player-list").innerHTML="";

    socket.emit("get players", roomID, function(p){
        //console.log(p);
        displayPlayersInWaiting(p);
    });

    socket.on('update players', function(){
        socket.emit("get players", roomID, function(p){
            displayPlayersInWaiting(p);
        });
    });

    socket.on('update game category', function(p) {
        categoryChoose = p;
        document.getElementById("option-pack").value = p;
    });

    socket.on('game start', function () {
        optionsActive = false;

        $('#waiting-room').fadeOut(800, function() {
            document.getElementById("waiting-options").style.display = "none";
            WrulesActive = false;
            document.getElementById("waiting-rule-display").style.display = "none";
            document.getElementById("waiting-room").style.display = "none";
            socket.removeAllListeners("game start");
            socket.removeAllListeners("update game category");
            socket.removeAllListeners("update players");
            $('#playerScreen').css('display', 'block');
            displayQuestionDisplay();

        });

        socket.on('game ended', function () {
            socket.removeAllListeners('game ended');
            socket.removeAllListeners("change num player ready");
            socket.removeAllListeners("players finished");
            socket.removeAllListeners("player asked");
            socket.removeAllListeners("player answered");
            socket.removeAllListeners("game start");
            socket.removeAllListeners("question asked");
            socket.removeAllListeners("display players");


            $('#playerScreen').fadeOut(800, function () {
                $('#playerDisplay').css('display', 'none');
                $('#askQuestionDisplay').css('display', 'none');
                $('#endGameButton').css('display', 'none');

                displayWaitingRoom();
                $('#waiting-room').fadeIn(800, function(){
                });
            });
            qStr = "", aStr = "", topic = "", category = "";
            isOutcast = false;
        });
    });

}


function displayPlayersInWaiting(p) {
    var s = "";
    for (let pl of p) {
        if (nameID == pl.id) {
            s += "<li class=\"col-12 waiting-player\">" +
                pl.name + " (You)" +
                "<span class=\"editName\">" +
                "<i class=\"fas fa-pencil-alt\" data-id='"+pl.id+"'></i></span></li>";
        } else {
            s += "<li class=\"col-12 waiting-player\">" +
                pl.name +
                "<span class=\"editName\">" +
                "<i class=\"fas fa-times deleteP\" data-id='"+pl.id+"'></i></span></li>";
        }
    }
    document.getElementById("waiting-player-list").innerHTML = s;

    $(".deleteP").on("click", function(e) {
        e.preventDefault();
        socket.emit('delete player', roomID, $(this).attr("data-id"), function(res) {
            if ($(this).attr("data-id") == nameID) {
                isLeaving = true;
                location.reload();
            }
        });
    });

    $(".fa-pencil-alt").on('click', function(e){
        e.preventDefault();
        nameChangeActive = true;
        document.getElementById("change-name").style.display = "block";
    });
}



function displayDBPlayers(pass, r) {
    socket.emit('display players', pass, r, function(p) {
        console.log(p);
    });
}
