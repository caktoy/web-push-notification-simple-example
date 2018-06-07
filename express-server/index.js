const port = process.env.PORT || 3030;
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const http = require('http').Server(app);
const socketIO = require('socket.io')(http);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', (req, res) => {
	res.json({'message': 'Hello world.'});
});

const users = [];
const room = '';

http.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

socketIO.on('connection', (socket) => {

	socket.on('subscribe', (data) => {
		console.log('subscribe', data);
		socket.join(data.post_id);

		users.push({id: socket.id, post_id: data.post_id});

		var sockets = [];
		Object.keys(socketIO.sockets.sockets).forEach(id => {
			users.map((user, index) => {
				if (user.id == id) {
					sockets.push(user);
				}
			});
		});

		socketIO.emit('subscribed', sockets);
	});

	socket.on('post comment', (data) => {
		console.log('post comment', data);
		socketIO.to(data.post_id).emit('comment received', data);
	});
});