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

function add_user(login, email, password, img)
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
          return console.error(err.message);
  console.log("Пользователь добавлен");
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
    console.log( dataRes);
      response.render('\question_read', {dataRes:  dataRes});
  });

  app.post("", urlencodedParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
            let login = request.body.login;
            let email = request.body.email;
            let password = request.body.password;
            let img = request.file;
            console.log(img);
            add_user(login, email, password, img.filename);
            response.sendFile(__dirname + "/public/success_user.html");
        });
  app.post("/index.html", urlencodedParser, function (request, response) {
      if(!request.body) return response.sendStatus(400);
            let login = request.body.login;
            let email = request.body.email;
            let password = request.body.password;
            let img = request.file;
            add_user(login, email, password, img.filename);
            response.sendFile(__dirname + "/public/success_user.html");
        });
    app.post("/question.html", urlencodedParser, function (request, response) {
        if(!request.body) return response.sendStatus(400);
          let email = request.body.email;
          let question = request.body.question;
          let img = request.file;
          add_question(email, question, img.filename);
          response.sendFile(__dirname + "/public/success_question.html");
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