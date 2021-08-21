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

// recuperar extrato bancário
app.get("/statement", (request, response) => {
    const {cpf} = request.headers;

    const customer = customers.find(c => c.cpf === cpf);

    if(!customer) return response.status(404).json({error: "Cliente não encontrado"})

    return response.json(customer.statement);
});

app.listen(3333);