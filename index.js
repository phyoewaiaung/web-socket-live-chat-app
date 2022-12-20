let express = require('express');
let socket = require('socket.io');
let mysql = require('mysql');

/** mysql connection */
let connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"web_chat"
})

connection.connect((e)=> {
    console.log(e);
})

/** app setup */
let app = express();
// add headers
app.use(function (request, result, next) {
    result.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

/** server setup */
let server = app.listen(4000,()=> {
    console.log('project is running on localhost 4000');
});

/** route setup */
app.get('/',(res,req)=> {
    req.sendFile(__dirname+'/public/login.html');
})

app.get('/index',(res,req)=> {
    req.sendFile(__dirname+'/public/index.html');
})

app.get('/register',(res,req)=> {
    req.sendFile(__dirname+'/public/register.html');
})

/** route setup end*/

// create API for get_message
app.get("/get_messages", function (request, result) {
    connection.query("SELECT * FROM messages ORDER BY id DESC", function (error, messages) {
        // return data will be in JSON format
        result.end(JSON.stringify(messages));
    });
});

/** socket setup */
let io = socket(server);
io.on('connection',(socket)=> {
    socket.on('info',(data)=> {
        // io.sockets.emit('info',data);
            // save message in database
            if(!(data.message == "" || data.name == "")){
                connection.query("INSERT INTO messages (message,name) VALUES ('"+data.message+"','"+data.name+"')" , function (error, result) {
                    // server will send message to all connected clients
                    io.emit("info", {
                        id: result.insertId,
                        name: data.name,
                        message: data.message
                    });
                });
            }
    })

    socket.on('all',(all)=> {
        io.emit('all',all)
    })

    socket.on('typing',(name)=> {
        socket.broadcast.emit('typing',name);
    })
})