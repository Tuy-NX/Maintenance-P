// Gõ lệnh node index.js để bắt đầu chạy server

var express = require('express')  // Module xử lí chung
var mysql = require('mysql2')     // Module cho phép sử dụng cơ sở dữ liệu mySQL 
var mqtt = require('mqtt')        // Module cho phép sử dụng giao thức mqtt

//var app = express()
var ports = 6060                   // Port của localhost do mình chọn

//
//const express= require('express');
const app = express();
var mosca = require('mosca')
const port =process.env.PORT || 3000;

var settings={
	port: 1883,
};
var http = require('http')
	, httpServ = http.createServer(app)
	, mosca= require('mosca')
	, mqttServ= new mosca.Server(settings);

mqttServ.attachHttpServer(httpServ);
httpServ.listen(3000)

mqttServ.on('ready', setup);
function setup(){
	console.log('Mosca server is up and running');
}
mqttServ.on('clientConnected',function(client){
	console.log('client connected',client.id);
});
mqttServ.on('clientDisconnected',function(client){
	console.log('client disconnected',client.id);
});
// mqttServ.on('published',function(packet, client){
// 	console.log('Published',packet.payload.toString());
// });

console.log(`app run on ${port}`);
//
var exportCharts = require('./export.js') // Require file export.js

app.use(express.static("public"))
app.set("views engine", "ejs")
app.set("views", "./views")

var server = require("http").Server(app)
var io = require('socket.io')(server)

app.get('/', function (req, res) {
    res.render('home.ejs')
})

app.get('/history', function (req, res) {
    res.render('history.ejs')
})

server.listen(ports, function () {
    console.log('Server listening on port ' + ports)
})

//----------------------MQTT-------------------------
var options = {
    host: '192.168.1.7',
    port: 1883,
    keepalive: 1000,
    // protocol: 'mqtts',
    // username: 'ngotruong2211@gmail.com',
    // password: 'Truongpro99',
    // clientId: 'serverjs2'
}

// initialize the MQTT client
var client = mqtt.connect(options);

// declare topics
var topic1 = "LED1";
var topic2 = "LED2";


var topic_list = ["mcb"];

console.log("connected flag  " + client.connected);
client.on("connect", function () {
    console.log("connected mqtt " + client.connected);
    //console.log('client connected',client.id);
});
client.on('clientConnected',function(client){
	//console.log('client connected',client.id);
});
client.on('clientDisconnected',function(client){
	console.log('client disconnected',client.id);
});
client.on("error", function (error) {
    console.log("Can't connect" + error);
    process.exit(1)
});

client.subscribe("mcb");

// SQL--------Temporarily use PHPMyAdmin------------------------------
var con = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'tuytuy2001',
    database: 'tuyptit'
});

//---------------------------------------------CREATE TABLE-------------------------------------------------
con.connect(function (err) {
    if (err) throw err;
    console.log("mysql connected");
    var sql = "CREATE TABLE IF NOT EXISTS sensors2(ID int(10) not null primary key auto_increment, Time datetime not null, Temperature int(3) not null, Humidity int(3) not null, Light int(5) not null )"
    con.query(sql, function (err) {
        if (err)
            throw err;
        console.log("Table created");
    });
})

var humi_graph = [];
var temp_graph = [];
var date_graph = [];

var m_time
var newTemp
var newHumi
var newLight

//--------------------------------------------------------------------
var cnt_check = 0;
client.on('message', function (topic, message, packet) {
    console.log("message is " + message)
    console.log("topic is " + topic)
    // const objData = JSON.parse(message)
    // if (topic == topic_list[0]) {
    //     cnt_check = cnt_check + 1
    //     newTemp  = objData.Temperature;
    //     newHumi  = objData.Humidity;
    //     newLight = objData.Light;
    // }

    // if (cnt_check == 1) {
    //     cnt_check = 0

    //     console.log("ready to save")
    //     var n = new Date()
    //     var month = n.getMonth() + 1
    //     var Date_and_Time = n.getFullYear() + "-" + month + "-" + n.getDate() + " " + n.getHours() + ":" + n.getMinutes() + ":" + n.getSeconds();

    //     var sql = "INSERT INTO sensors2 (Time, Temperature, Humidity, Light) VALUES ('" + Date_and_Time.toString() + "', '" + newTemp + "', '" + newHumi + "', '" + newLight + "')"
    //     con.query(sql, function (err, result) {
    //         if (err) throw err;
    //         console.log("Table inserted");
    //         console.log(Date_and_Time + " " + newTemp + " " + newHumi + " " + newLight)
    //     });

    //     exportCharts(con, io)
    // }
})
//----Socket---------Control devices----------------------------

io.on('connection', function (socket) {
    console.log(socket.id + " connected")
    socket.on('disconnect', function () {
        console.log(socket.id + " disconnected")
    })

    socket.on("LED1", function (data) {
        if (data == "on") {
            console.log('LED1 ON')
            client.publish(topic1, 'LED1ON');
        }
        else {
            console.log('LED1 OFF')
            client.publish(topic1, 'LED1OFF');
        }
    })

    socket.on("LED2", function (data) {
        if (data == "on") {
            console.log('LED2 ON')
            client.publish(topic2, 'LED2ON');
        }
        else {
            console.log('LED2 OFF')
            client.publish(topic2, 'LED2OFF');
        }
    })


    // Send data to History page
    // var sql1 = "SELECT * FROM sensors2 ORDER BY ID"
    // con.query(sql1, function (err, result, fields) {
    //     if (err) throw err;
    //     console.log("Full Data selected");
    //     var fullData = []
    //     result.forEach(function (value) {
    //         var m_time = value.Time.toString().slice(4, 24);
    //         fullData.push({ id: value.ID, time: m_time, temp: value.Temperature, humi: value.Humidity,light: value.Light })
    //     })
    //     io.sockets.emit('send-full', fullData)
    // })
})
