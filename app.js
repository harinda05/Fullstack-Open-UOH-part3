const express = require('express')
var morgan = require('morgan')
require('dotenv').config()
const cors = require('cors')
const Person = require('./models/person')


const app = express()

app.use(express.json())
app.use(express.static('dist'))
app.use(cors({
    origin: "https://fullstack-open-uoh-part3-2.onrender.com/"
}
))


morgan.token('json_body', function getBody (req) {
    return JSON.stringify(req.body)
  })
  
app.use(morgan(':method :url :status :response-time ms :json_body'))


let phoneBook = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
]

// get all persons
app.get('/api/persons', (request, response) => {
    Person.find({}).then(result => {
        console.log("queried all persons from db %s", result)
        response.send(result)
    })
})

// get info
app.get('/info', (request, response) => {
    const date = new Date();
    response.send(
        `<p>Phonebook has infor for ${phoneBook.length} people <br/> ${date.toString()} </p>`
    )
})


// get single person
app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findOne({ id })
    .then(person => {
      if (person) {
        response.status(200).json(person);
      } else {
        response.status(404).json({ error: `No person found with id: ${id}` });
      }
    })
    .catch(error => {
      console.error(error);
      next(error); 
    });
});


// delete single person
app.delete('/api/persons/:id', (request, response, next) => {
    const id = request.params.id.toString()
    console.log ("deleting: " + id)
    Person.findOneAndDelete({ ["id"]: id })
    .then(result => {
        if (result) {
            console.log(`Deleted person: ${result}`);
            response.status(200).json(result);
          } else {
            console.log(`No person found with id: ${id}`);
            response.status(404).json({ error: `No person found with id: ${id}` });
          }
    })
    .catch(error => {
        console.log(error)
        //response.status(404).end() //todo move to middleware
        next(error)
        }
    )

    // const personIndex = phoneBook.findIndex(person => person.id === id);

    // if(personIndex !== -1){
    //     const deletedPerson = phoneBook.splice(personIndex, 1)[0];
    //     response.status(200).json(deletedPerson);
    // } else {
    //     response.status(404).end()
    // }

})

// add new person
app.post('/api/persons', (request, response, next) => {
    const id = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    if(!request.body.name || !request.body.number){
        response.status(400).send({ error: 'malformed request body' })
    } else if (phoneBook.find(person => person.name === request.body.name)){
        response.status(400).send({ error: 'name must be unique'  })
    } else {

        const person = new Person({
            id: id.toString(),
            name: request.body.name,
            number: request.body.number
        })

        person.save().then(savedPerson => {
            console.log("saved new person in db %s", savedPerson);
            response.send(savedPerson)
        })
        .catch(error => next(error))
    }

})

//update user
// update person by name (if name exists)
app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    const { name, number } = request.body;
  
    if (!name || !number) {
      return response.status(400).send({ error: 'name and number are required' });
    }
  
    Person.findOneAndUpdate({ id: id }, { number }, { new: true ,  runValidators: true, context: 'query'})
      .then(updatedPerson => {
        if (updatedPerson) {
          console.log(`Updated person: ${updatedPerson}`);
          response.status(200).json(updatedPerson);
        } else {
          response.status(404).json({ error: `No person found with id: ${id}` });
        }
      })
      .catch(error => {
        console.error(error);
        next(error);
      });
  });
  
  //update user
app.put('/api/persons/:id', (request, response, next) => {
    const id = request.params.id;
    const { name, number } = request.body;
  
    if (!name || !number) {
      return response.status(400).send({ error: 'name and number are required' });
    }
  
    Person.findOneAndUpdate({ id: id }, { new: true ,  runValidators: true})
      .then(updatedPerson => {
        if (updatedPerson) {
          console.log(`Updated person: ${updatedPerson}`);
          response.status(200).json(updatedPerson);
        } else {
          response.status(404).json({ error: `No person found with id: ${id}` });
        }
      })
      .catch(error => {
        console.error(error);
        next(error);
      });
  });

//error handler
const errorHandler = (error, request, response, next) => {
    console.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
      }
      next(error)
    return response.status(404).end()
  }
  
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})