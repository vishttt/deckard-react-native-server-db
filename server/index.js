// const m = require('mitsuku-api-gold')();
const uniqid = require('uniqid');
const mitsuku = require('./lib/mitsukuHelper')();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());


app.post('/api/mitsuku', (req, res) => {
    console.log('server hit');
    console.log('server side request: ', req.body);
    // m.send(req.body.message)
    //   .then(function(response) {
    //     let parsedMessage = parseMessageFromHtml(response);
    //       console.log('this is the parsed message: ', parsedMessage);
    //   });
    mitsuku.send(req.body)
      .then(response => {
          console.log('mitsukus response: ', response);
      });

    // fetch('https://facebook.github.io/react-native/movies.json')
    //   .then((response) => {
    //       response.json()
    //       console.log(response.json());
    //     })
    //   .then((responseJson) => {
    //     res.send(JSON.stringify(responseJson.movies));
    //   })
    //   .catch((error) =>{
    //     // console.error(error);
    //     res.send('error');
    //   });

    // res.send('haha!!!');
});

const server = app.listen(process.env.PORT || 8080, () => {
    console.log(`Listening on port ${process.env.PORT || 8080}!`);
});
const io = require('socket.io')(server);

// initial socket connection
io.on('connection', socket => {
    // on listener
    console.log('connected to socket!', socket.id);

    let room, addedUsers; 
    let acceptedUsers = [];

    socket.on('accept or decline', data => {
        if (data.reply === 'accept') {
            acceptedUsers.push(data.user);

            // if (addedUsers.length === acceptedUsers.length) {
            //     io.sockets.emit('all users ready');
            // }
        } 

        if (data.reply === 'decline') {
            addedUsers.splice(addedUsers.indexOf(data.user), 1);

            // if (addedUsers.length === acceptedUsers.length) {
            //     io.sockets.emit('all users ready');
            // }
        }

        if (addedUsers.length - 1  === acceptedUsers.length) {
            io.sockets.emit('all users ready');
        }
    })

    socket.on('send new message', data => {
        console.log('new message', data);
        io.in(room).emit('received new message', data);
    });

    socket.on('create new room', data => {
        room = uniqid(`${data.roomName}-`);
        io.sockets.emit('invite', { 
            roomID: room, 
            roomName: data.roomName,
            addedUsers: data.addedUsers,
            roomCreator: data.roomCreator,
        });
        socket.join(room);
    });

    socket.on('join', data => {
        room = data.roomID;
        addedUsers = data.addedUsers;
        socket.join(room);
    });
});