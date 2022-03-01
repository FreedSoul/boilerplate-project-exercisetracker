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
  let CreateOneUser = () => {
    User.create({username: userToPost},function(error, data){
      if (error) return console.log(error)
      console.log('se ha creado un nuevo usuario')
    })
  }
  CreateOneUser();
  //se crea un usuario nuevo (puede ser repetido)
  //se busca en db si hay algun nombre con el input y se muestra el id
  User.findOne({username: userToPost}, '_id',(error, idNewUser) => {
    if (error) return console.log(error)
    console.log('entre en la busqueda2')
    if (idNewUser){
      res.json({
        "username": req.body.username,
        "_id": idNewUser._id 
      })
    }else{
      res.json({
        "username": req.body.username,
        "_id": 'no encontrado, se ha creado un nuevo usuario'
      })
    }  
  }) 
})

app.get('/api/users', (req, res) => {
  User.find({}, '_id, username',(error, data) => {
    if (error) return console.log(error)
    console.log('entre en la busqueda2')
    res.json(data)
  })  
})


app.post('/api/users/:_id/exercises', (req, res) => {
  let exercises = req.body.description
  let id = req.body[':_id']
  let duration = req.body.duration
  let date = req.body.date
  if (!date) {
    // date = new Date(Date.now()).toLocaleString()
    let today = new Date()
    date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  }
  //validar si el id no es null, check db for the exercises list for that id, then res user object with the exercise fields added
  console.log(id,exercises)
  res.json({
    "duration":  duration,
    'id': id,
    'exercises': exercises,
    'date': date
    
  })
})

// app.get('/api/users/:_id/exercises', (req,res) => {
//   res.json({
//     //devolver un log de cualquier id de usuario
//   })
// })

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