


var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var categories = require('./js/categories.js');

app.use('/assets', express.static('assets'));


app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html');
});


class Room {
    constructor(roomid) {
        this.roomid = roomid;
        this.startingGame = false;
        this.gamestart = false;
        this.player = [];
        this.topic = "";
        this.fakeTopic = "";
        this.category = "";
        this.isRandom = true;
        this.outcastID = -1;
    }
}

class Player {
    constructor(name, id, roomid, sk) {
        this.roomid = roomid;
        this.id =id;
        this.name = name;
        this.answerPartner = {
            id: -1,
            name: "",
            answer: ""
        }; // this it the person answering the question of the player
        this.questionPartner = {
            name: "",
            id : -1,
            answer : ""
        }; // this is the person asking the question to player
        this.socket=sk;
        this.question = "Waiting...";
        this.answer = "Waiting...";
        this.isOutcast = false;
        this.isReady = false;
    }
    getData() {
        return {
            id: this.id,
            name: this.name,
            answerPartner: {
                id: this.answerPartner.id,
                name: this.answerPartner.name,
                question: this.answerPartner.question,
                answer: this.answerPartner.answer,
                isOutcast: this.answerPartner.isOutcast
            },
            questionPartner: {
                id: this.questionPartner.id,
                name: this.questionPartner.name,
                question: this.questionPartner.question,
                answer: this.questionPartner.answer,
                isOutcast: this.answerPartner.isOutcast
            },
            question: this.question,
            answer: this.answer,
            isOutcast: this.isOutcast
        }
    }
}

var rooms = {};


io.on('connection', function(socket) {
    //console.log("connected");

    socket.emit('get room id', function(id){
        if (id!="") {
            if (rooms[id] != null) {
                socket.join(id);
                socket.emit('display current view', rooms[id].gamestart);
            }
        }
    });

    socket.on('join room', function(roomid, name, callback){
        if (rooms[roomid]==null) {
            callback&&callback("null", 0);
            return;
        }
        if (rooms[roomid].gamestart) {
            callback&&callback("started", 0);
            return;
        }
        if (rooms[roomid].player.length > 10) {
            callback&&callback("full", 0);
            return;
        }

        var numPlayers = rooms[roomid].player.length+1;
        socket.join(roomid);
        rooms[roomid].player.push(new Player(name, numPlayers, roomid, socket));
        callback&&callback("success", numPlayers);
        io.to(roomid).emit("update players");
    });

    socket.on('create room', function(roomid, name, callback) {

        if (rooms[roomid]!=null) {
            callback&&callback("taken");
            return;
        }

        var ro = new Room(roomid);
        rooms[roomid] = ro;
        rooms[roomid].player.push(new Player(name, 1, roomid, socket));
        socket.join(roomid);
        callback && callback("success");
    });

    socket.on('change player name', function(roomid, id, n) {
        if (rooms[roomid]==null) return;
        rooms[roomid].player[id-1].name = n;
        io.to(roomid).emit("update players");
    });

    socket.on('update game category', function(roomid, p) {
        if (rooms[roomid]==null)return;
        rooms[roomid].category = p;
        if (p=="Random")rooms[roomid].isRandom = true;
        else rooms[roomid].isRandom = false;
        io.to(roomid).emit('update game category', p);
    });

    socket.on('delete player', function(roomid, id, callback) {
        if (rooms[roomid]==null) return;
        var pl = rooms[roomid].player;
        if (pl.length ==1) {
            delete rooms[roomid];
            callback && callback();
            return;
        }

        for (var i = id; i < pl.length; i++) {
            rooms[roomid].player[id-1].name = pl[i].name;
            rooms[roomid].player[id-1].id = pl[i].id-1;
            rooms[roomid].player[id-1].socket = pl[i].socket;
        }


        rooms[roomid].player.splice(pl.length-1, 1);
        io.to(roomid).emit('player leave', rooms[roomid].gamestart, id);
        callback && callback();
    });

    socket.on('get players', function(roomid, cb) {
       if (rooms[roomid]==null)return;
       var r = [];
       for (var i = 0; i< rooms[roomid].player.length; i++) {
           r.push(rooms[roomid].player[i].getData());
       }
       cb&&cb(r);
    });

    socket.on('get room info', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        cb&&cb({
            category: rooms[roomid].category,
            topic: rooms[roomid].topic,
            fakeTopic: rooms[roomid].fakeTopic,
            gamestart: rooms[roomid].gamestart,
            outcastID: rooms[roomid].outcastID
        });
    });

    socket.on('get player info', function(roomid, id, cb) {
        if (rooms[roomid]==null || rooms[roomid].player[id-1]==null) return;
        cb&&cb(rooms[roomid].player[id-1].getData());
    });

    socket.on('set question', (roomid, id, q, cb) => {
        if (rooms[roomid]==null) return;
        rooms[roomid].player[id-1].question =q;
        rooms[roomid].player[id-1].answerPartner.socket.emit('question asked', q);
        io.to(roomid).emit('player asked', {
            id: id,
            question: q
        });
        cb&&cb();
    });

    socket.on('set answer', function(roomid, id, a, cb) {
        if (rooms[roomid]==null) return;
        rooms[roomid].player[id-1].answer = a;
        io.to(roomid).emit('player answered', {
            id: id,
            name: rooms[roomid].player[id-1].name,
            answer: a
        });
        var pFinish = true;
        for (var i = 0; i < rooms[roomid].player.length; i++) {
            if (rooms[roomid].player[i].answer == "Waiting...") pFinish = false;
        }
        if (pFinish) io.to(roomid).emit('players finished');
        cb&&cb();
    });

    socket.on('start game', function(roomid) {
        if(rooms[roomid]==null)return;
        if (rooms[roomid].player.length < 3) return;
        if (rooms[roomid].startingGame) return;

        rooms[roomid].startingGame = true;
        rooms[roomid].gamestart = true;

        //choose random category and topic
        var randId = [];
        for (var i = 1; i < rooms[roomid].player.length; i++) {
            randId.push(i);
        }
        for (var i = 0; i < randId.length; i++) {
            var a = randId[i];
            var rN = parseInt(Math.random()*randId.length);
            randId[i] = randId[rN];
            randId[rN] = a;
        }
        randId.push(0);

        for (var i = 0; i < randId.length-1; i++) {
            var n = randId[i];

            rooms[roomid].player[n].answerPartner = rooms[roomid].player[randId[i+1]];
            rooms[roomid].player[randId[i+1]].questionPartner = rooms[roomid].player[n];
        }
        rooms[roomid].player[0].answerPartner = rooms[roomid].player[randId[0]];
        rooms[roomid].player[randId[0]].questionPartner = rooms[roomid].player[0];


        /*
        for (var p of rooms[roomid].player) {
            console.log("ID: " + p.id + " Q: " + p.questionPartner.id + " A: " + p.answerPartner.id);
        }
        */
        for (var b = 0; b < rooms[roomid].player.length;b++) {
          rooms[roomid].player[b].isOutcast = false;
        }
        var aN = parseInt(Math.random()*rooms[roomid].player.length);
        rooms[roomid].outcastID = aN +1;
        rooms[roomid].player[aN].isOutcast = true;

        var acat;
        if (rooms[roomid].isRandom) {
            acat = categories.getRandomCategory();
        } else {
            acat = categories.getCategory(rooms[roomid].category);
        }
        rooms[roomid].fakeTopic = acat.fakeTopic;
        rooms[roomid].topic = acat.topic;
        rooms[roomid].category = acat.category;
        io.to(roomid).emit('game start');
    });

    socket.on('end game', function(roomid) {
       if (rooms[roomid]==null) return;
       rooms[roomid].gamestart = false;
        rooms[roomid].startingGame = false;
        for (var i = 0; i < rooms[roomid].player.length; i++) {
            rooms[roomid].player[i].isReady = false;
            rooms[roomid].player[i].question = "Waiting...";
            rooms[roomid].player[i].answer = "Waiting...";
            rooms[roomid].player[i].isOutcast = false;
        }
        io.to(roomid).emit('game ended');
    });

    socket.on('ready for display players', function(roomid, id, cb) {
        if (rooms[roomid]==null)return;
        rooms[roomid].player[id-1].isReady = true;
        var a = true;
        var c = 0;
        for (var i = 0; i < rooms[roomid].player.length; i++) {
            if (rooms[roomid].player[i].isReady ==false) a = false;
            else c++;
        }
        io.to(roomid).emit("change num player ready", c, rooms[roomid].player.length);
        if (a) io.to(roomid).emit('display players');
    });

    socket.on('ready display players', function(roomid, cb) {
        if (rooms[roomid]==null)return;
        var a = true;
        for (var i = 0; i < rooms[roomid].player.length; i++) {
            if (rooms[roomid].player[i].isReady ==false) a = false;
        }
        cb&&cb(a);
    });


    socket.on('delete all rooms', function(pass) {
        if (pass=="sup") rooms = {};
    });

    socket.on('display players', function(pass, roomid, callback) {
        if (pass != "sup") return;
        if (roomid==null) return;
        var a = [];
        for (var i = 0;i < rooms[roomid].player; i++){
            a.push(rooms[roomid].player[i].getData());
        }
        console.log(a);
        callback&&callback(a);
        return;
    });
});



http.listen(8000, function(){
    console.log('listening on *:8000');
});
