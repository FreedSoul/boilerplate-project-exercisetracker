const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
let mongoose;
try {
  mongoose = require('mongoose')
}catch (e){
  console.log(e)
}
require('dotenv').config()

app.use(cors())
app.use(bodyParser.urlencoded({extended:false}))
// app.use(bodyParser.json())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_KEY, {useNewUrlParser: true, useUnifiedTopology: true});  

//mongo schema and instatiation
const UserSchema = new mongoose.Schema({
  username: String,
  description: [String],
  duration: Number,//[Number]
  date: String
})

let User = mongoose.model("user", UserSchema)

let arrayOfClients = [{username: 'matt', duration: 28 , description:['Push-ups','Push-ups']},
{username: 'camila', duration: 21 , description:['Squats','Push-ups']},
{username: 'tadeo', duration: 29 , description:['Push-ups','Squats']},
{username: 'maria', duration: 48 , description:['Push-ups','Squats']},
{username: 'andres', duration: 38 , description:['Squats','Push-ups']}]

// User.create(arrayOfClients,function(error,data){
//     if (error) return console.log(error)
// })

app.post('/api/users', (req, res) => {
  let userToPost = req.body.username
  let idToResponse;
  let CreateOneUser = (done) => {
    User.create({username: userToPost},function(error, data){
      if (error) return console.log(error)
      //done(null, data)
      console.log(typeof userToPost)
    })
    
    
  }
  CreateOneUser();
  // User.find({username:/matt/i}, '_id',(error, data) => {
  //   if (error) return console.log(error)
  //   console.log('entre en la busqueda')
  //   idToResponse = data;
  // })
  // let foundUser = User.exists({ username: /mate/i })
  User.findOne({username: userToPost}, '_id',(error, idNewUser) => {
    if (error) return console.log(error)
    console.log('entre en la busqueda2')
    res.json({
      "username":  req.body.username,
      idNewUser //id de la conexion con mongo
    })
  }) 
  // res.json({
  //     "username":  req.body.username,
  //     "id": User.exists({ username: /mate/i })//id de la conexion con mongo
  // })
})

app.get('/api/users', (req, res) => {
  User.find({}, '_id, username',(error, data) => {
    if (error) return console.log(error)
    console.log('entre en la busqueda2')
    res.json({
       data //id de la conexion con mongo
    })
  })  
})

// app.get('/api/users', (req,res) => {
//   res.json({
//     hola:'hola'
//     //mostrar todo los usuario registrados en un array
//     //[{user,_id},{},{},{},]
//   })
// })

app.post('/api/users/:_id/exercises', (req, res) => {
  res.json({
      username:  req.body.username,
      _id: 'x'//id de la conexion con mongo
    // will be the user object with the exercise fields added.
  })
})

app.get('/api/users/:_id/exercises', (req,res) => {
  res.json({
    //devolver un log de cualquier id de usuario
  })
})

app.get('/api/users/:_id/logs', (req, res) => {
  // user{count excercises per user}
})

app.get('/api/users/:id/logs', (req, res) => {
  // user {log[excercises, description(string),duration(number),date(string*dateString method*)]}
})

//last point go read



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})