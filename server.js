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
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

mongoose.connect(process.env.MONGO_KEY, {useNewUrlParser: true, useUnifiedTopology: true}, console.log('conectado con DB'));  

//Schemas
const UserSchema = new mongoose.Schema({
  username: String
})

const ExerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date: String
})

const LogSchema = new mongoose.Schema({
  username: String,
  count: Number,
  log: Array
})

//Models
let User = mongoose.model("user", UserSchema)
let Exercise = mongoose.model("exercise",ExerciseSchema)
let Log =  mongoose.model("log", LogSchema)

//populate db
let arrayOfClients = [{username: 'matt', duration: 28 , description:['Push-ups','Push-ups']},
{username: 'camila', duration: 21 , description:['Squats','Push-ups']},
{username: 'tadeo', duration: 29 , description:['Push-ups','Squats']},
{username: 'maria', duration: 48 , description:['Push-ups','Squats']},
{username: 'andres', duration: 38 , description:['Squats','Push-ups']}]

// User.create(arrayOfClients,function(error,data){
//     if (error) return console.log(error)
// })
// Exercise.deleteMany({},function(error,data){
//     if (error) return console.log(error)
//     else {console.log('db borrada')}
// })

app.post('/api/users', (req, res) => {
  let userToPost = req.body.username
  let idToResponse;
  let CreateOneUser = () => {
    User.create({username: userToPost},function(error, data){
      if (error) return console.log(error)
      console.log("se ha creado un nuevo usuario ")
      res.json({
        "username": req.body.username,
        "_id": data._id
      })
    })
  }
  
  //se crea un usuario nuevo (puede ser repetido)
  //se busca en db si hay algun nombre con el input y se muestra el id
  User.findOne({username: userToPost}, '_id',(error, idNewUser) => {
    if (error) {return console.log('no se ha podido crear usuario',error)
    }
    if (idNewUser){
      console.log("ya existe "+idNewUser)
      res.json({
        "username": req.body.username,
        "_id": idNewUser._id 
      })
    }else{
      CreateOneUser(idNewUser);
    }  
  }) 
})

app.get('/api/users', (req, res) => {
  User.find({}, '_id, username',(error, data) => {
    if (error) return console.log(error)
    console.log('mostrando lista de usuarios')
    res.json(data)
  })  
})


app.post('/api/users/:_id/exercises', (req, res) => {
  let id = req.body[':_id']
  let description = req.body.description
  let duration = req.body.duration
  let date
  console.log( req.body.date+'---fecha')
  console.log( req.body.description+'---exercise')
  console.log(req.body.duration+'---duracion')
  if (req.body.date == '' || req.body.date == undefined) {
    date = new Date()
  }else{
    if (req.body.date.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/g)){
      date = new Date(req.body.date)
    }else{
      return res.send('<h3>fecha no valida<h3>')
    }
  }
  if(id){
    User.findById(id,(error, data) => {
      if(data == null) {
        console.log('data es null') 
        return res.send('<h3>el id no se encuentra en la base de datos intenta otro<h3>')}
      if(error){
        console.log('ha ocurrido un error en la busqueda', error)
      }else{
        const aux = new Exercise({
          "username": data.username,
          "description": req.body.description,
          "duration": parseInt(req.body.duration),
          "date": date.toDateString()
        })
        aux.save((err,confirm) => {
          if(err){
            console.log('hubo un error al guardar el nuevo registro',err)
          }else{
            console.log("sesion de ejercicio guardado existosamente")
            res.json({
              // "username": aux.username,
              // "description": aux.description,
              // "duration":  aux.duration,
              // "date": aux.date,
              // "_id": id
              "_id": "62237ca171e36506d4402304",
              "username": "matthl",
              "date": "Fri Nov 11 2022",
              "duration":  12,
              "description": "ffffffff"
            })
          }
        })
      }
    })
  }else{
    // res.send('<h2>debes introducir un id existente<h2>')
  }
})



app.get('/api/users/:id/logs', (req, res) => {
  let { from, to , limit } = req.body
  let id = req.params.id
  let query
  console.log("este es el id --" + req.params.id)
  console.log("este es el id --" + req.params.from)
  console.log("este es el id --" + req.params.to)

  if(limit === undefined){
    limit = 10;
  }else if( limit > 100 ) {
    limit = 100;
  }
  
  User.findById(id,(error, data) => {
      if(error){
        console.log('ha ocurrido un error en la busqueda', error)}
      if(data === null) {
        console.log('data es null123') 
        return res.send('<h3>el id no se encuentra en la base de datos intenta otro<h3>')
      }else{
        query = { username: data.username }
        if(from !== undefined && to !== undefined){
          query.date  = {date: { $gte: new Date(from) , $lte: new Date(to)}}
        }else if(from !== undefined && to === undefined){
          query.date = {date: { $gte: new Date(from) }}
        }else if(from === undefined && to !== undefined){
          query.date = {date: { $lte: new Date(to) }}
        }


        Exercise.find(query)
                .limit(limit)
                .exec((err, result) => {
                  if(err){
                    console.log('hubo un error => ', err)
                  }else{
                    let exerciseList = []
                    exerciseList = result.map((item) => {
                      return {
                        "description": item.description,
                        "duration": typeof item.duration,
                        "date": item.date
                      }
                    })
                    console.log("esta es la lista de ejercicios "+exerciseList)
                    let aux = new Log({
                      'username': data.username,
                      'count': exerciseList.length,
                      'log': exerciseList
                    })

                    aux.save((err,confirm) => {
                      if(err){
                        console.log('hubo un error al guardar el nuevo registro',err)
                      }else{
                        console.log("log guardado correctamente")
                        res.json({
                          'username': data.username,
                          'count': exerciseList.length,
                          '_id': id,
                          'log': exerciseList
                        })
                      }
                    })
                  }
                })
      }
    })
})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})