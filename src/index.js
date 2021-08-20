const express = require('express');
const { v4: uuidV4 } = require("uuid");

const app = express();
app.use(express.json());

// BD fake
const customers = [];

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some(x => x.cpf === cpf);
    if(customerAlreadyExists) return response.status(400).json({error: "Cliente já existe"});

    customers.push({
        cpf,
        name,
        id: uuidV4(),
        statement: []
    });

    return response.status(201).send();
});

app.listen(3333);