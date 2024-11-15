const express = require('express')
var morgan = require('morgan')

const app = express()

app.use(express.json())

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
    response.send(phoneBook)
})

// get info
app.get('/info', (request, response) => {
    const date = new Date();
    response.send(
        `<p>Phonebook has infor for ${phoneBook.length} people <br/> ${date.toString()} </p>`
    )
})


// get single person
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person  = phoneBook.find(person => person.id === id )

    if(person){
        response.send(person)
    } else {
        response.status(404).end()
    }
})


// delete single person
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id

    const person  = phoneBook.find(person => person.id === id )

    if(person){
        phoneBook.splice(id - 1, 1)
        response.status(204).end()
    } else {
        response.status(404).end()
    }

})

// add new person
// get all persons
app.post('/api/persons', (request, response) => {
    const id = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;

    const person = {
        id: id,
        name: request.body.name,
        number: request.body.number
    }

    if(!request.body.name || !request.body.number){
        response.status(400).send({ error: 'malformed request body' })
    } else if (phoneBook.find(person => person.name === request.body.name)){
        response.status(400).send({ error: 'name must be unique'  })
    } else {
        phoneBook.push(person)
        response.send(phoneBook.find(person => person.id === id))
    }

})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`)
})