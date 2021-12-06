let http = require('http');
let fs= require('fs');
let express = require('express');
let app = express();
const urlencodedParser = express.urlencoded({extended: false});
const sqlite = require('sqlite3').verbose();
const multer  = require("multer");
let dataRes;

app.use('/public', express.static('public'));
app.use('/upload', express.static('upload'));
app.use('/views', express.static('views'));

app.set('view engine', 'ejs');

app.use(multer({dest:"upload"}).single("img"));

function add_user(login, email, password, img, request, response)
{
  const db = new sqlite.Database('reg.db', sqlite.OPEN_READWRITE, (err) =>
  {
      if(err)
          return console.error(err.message);
      console.log("Успешное подключение к БД");
  } );
  const insert_user = `INSERT INTO Users (login, email, password, img)
              VALUES($name, $Em, $pw, $img)`;
  let QueryData = {$name: login, $Em: email, $pw: password, $img: img};
  db.run(insert_user, QueryData, (err) =>{
      if (err)
      {
      	response.sendFile(__dirname + "/public/error_user.html");
        return console.error(err.message);
      }
      else
      {
      	response.sendFile(__dirname + "/public/success_user.html");
  		console.log("Пользователь добавлен");
	  }
  });
  db.close((err) =>{
    if(err)
    return console.error(err.message);
  });
}

function add_question(email, question, img)
{
  const db = new sqlite.Database('reg.db', sqlite.OPEN_READWRITE, (err) =>
  {
      if(err)
          return console.error(err.message);
      console.log("Успешное подключение к БД");
  } );
  const insert_question=`INSERT INTO Questions (email, question, img)
              VALUES($Em, $que, $img)`;
  let QueryData = {$Em: email, $que: question, $img: img};
  db.run(insert_question, QueryData, (err) =>{
      if (err)
          return console.error(err.message);
  console.log("Вопрос добавлен");
  });
  db.close((err) =>{
      if(err)
      return console.error(err.message);
  });
}

function get_question()
{
  const db = new sqlite.Database('reg.db', sqlite.OPEN_READWRITE, (err) =>
  {
      if(err)
          return console.error(err.message);
      console.log("Успешное подключение к БД");
  } );
  const select_question=`SELECT * FROM Questions`;
  db.all(select_question, [], (err, result) =>{
      if (err)
          return console.error(err.message);
  console.log("Запрос выполнен успешно");
  dataRes = JSON.parse(JSON.stringify(result));
  });
}

function auth(login, password, request, response)
{
  const db = new sqlite.Database('reg.db', sqlite.OPEN_READWRITE, (err) =>
  {
      if(err)
          return console.error(err.message);
      console.log("Успешное подключение к БД");
  } );
  const select_user=`SELECT * FROM Users WHERE login = $login AND password = $password`;
  let QueryData = {$login: login, $password: password};
  db.all(select_user, QueryData, (err, result) =>{
      if (err)
      {
      	response.sendFile(__dirname + "/public/error_auth.html");
        return console.error(err.message);
      }
      else
      {
      	console.log("Запрос выполнен успешно");
      	dataRes = JSON.parse(JSON.stringify(result));
      	if (dataRes=="")
      	{
      		response.sendFile(__dirname + "/public/error_auth.html");
      	}
      	else 
      	{
      		//console.log(dataRes);
      		response.render('\success_auth', {nick:  login});
      	}
      }
  db.close((err) =>{
    if(err)
    return console.error(err.message);
  });
  });
}

function createServer(){
  
  app.get("/index.html", function (request, response) {
      response.sendFile(__dirname + "/public/index.html");
  });
  app.get("", function (request, response) {
      response.sendFile(__dirname + "/public/index.html");
  });
  app.get("/question.html", function (request, response) {
      response.sendFile(__dirname + "/public/question.html");
  });
  app.get("/question_read.html", function (request, response) {
      get_question();
      response.render('\question_read', {dataRes:  dataRes});
  });
  app.get("/auth.html", function (request, response) {
      response.sendFile(__dirname + "/public/auth.html");
  });

  app.post("", urlencodedParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
            let login = request.body.login;
            let email = request.body.email;
            let password = request.body.password;
            let img = request.file;
            add_user(login, email, password, img.filename, request, response);
        });
  app.post("/index.html", urlencodedParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
            let login = request.body.login;
            let email = request.body.email;
            let password = request.body.password;
            let img = request.file;
            add_user(login, email, password, img.filename, request, response);
        });
    app.post("/question.html", urlencodedParser, function (request, response) {
        if(!request.body) return response.sendStatus(400);
          let email = request.body.email;
          let question = request.body.question;
          let img = request.file;
          add_question(email, question, img.filename);
          response.sendFile(__dirname + "/public/success_question.html");
  });
    app.post("/auth.html", urlencodedParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
            let login = request.body.login;
            let password = request.body.password;
            auth(login, password, request, response);
        });
}

createServer();
get_question();

app.listen(
3000, "localhost", function() 
{
  console.log("Сервер работает, используя порт 3000");
}
);