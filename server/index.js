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

const aliases = [
    'HAL 9000',
    'Android 18',
    'AM',
    'Siri',
    'Roy Batty',
    'Pris',
    'Rachael',
    'C-3PO',
    'Ash',
    'T-800',
    'T-1000',
    'Alexa',
    'Johnny 5',
    'Robocop',
    'Rosie',
    'Cortana',
    'HK-47',
    'GlaDOS',
    'SHODAN',
    'Dolores',
    '2B'];

// initial socket connection
io.on('connection', socket => {
    // on listener
    console.log('connected to socket!', socket.id);

    let room, addedUsers; 
    let acceptedUsers = [];
    let aliasesCopy = aliases;
    let acceptedUsersAliases = {};
    let usersWhoVoted = [];

    socket.on('accept or decline', data => {
        if (data.reply === 'accept') {
            acceptedUsers.push(data.user);
        } 

        if (data.reply === 'decline') {
            addedUsers.splice(addedUsers.indexOf(data.user), 1);
        }

        if (addedUsers.length - 1  === acceptedUsers.length) {
            for (let acceptedUser of addedUsers) {
                acceptedUsersAliases[acceptedUser] = aliasesCopy.splice(Math.floor(Math.random() * Math.floor(aliasesCopy.length)),1)
            }
            io.sockets.emit('all users ready', { acceptedUsersAliases, acceptedUsers });
        }
    })

    socket.on('send new message', data => {
        let message = data.message;
        let user = data.user;
        io.in(room).emit('received new message', { message, user });
    });

    socket.on('create new room', data => {
        room = uniqid(`${data.roomName}-`);
        io.sockets.emit('invite', { 
            roomID: room, 
            roomName: data.roomName,
            addedUsers: data.addedUsers,
            roomCreator: data.roomCreator,
            timer: data.timer
        });
        socket.join(room);
    });

    socket.on('join', data => {
        room = data.roomID;
        addedUsers = data.addedUsers;
        socket.join(room);
    });

    socket.on('user voted', data => {
        usersWhoVoted.push(data.userWhoVotedEmail);
        console.log(usersWhoVoted);
        console.log(addedUsers);
        io.sockets.emit('voting complete');
        // if (usersWhoVoted.length === addedUsers.length - 1) {
        //     io.sockets.emit('voting complete');
        // }
    });
});