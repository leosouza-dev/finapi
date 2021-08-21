const express = require('express');
const { v4: uuidV4 } = require("uuid");
const app = express();

app.use(express.json());

// BD fake
const customers = [];

// Middleware
function verifyIfExistsAccountCPF(request, response, next){
    const {cpf} = request.headers;
    const customer = customers.find(c => c.cpf === cpf);
    if(!customer) return response.status(404).json({error: "Cliente não encontrado"});

    // repassando o cliente
    request.customer = customer;

    return next();
}

function getBalance(statement){
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === "credit") return acc + operation.amount;
        if(operation.type === "debit") return acc - operation.amount;
    }, 0);

    return balance;
}

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

app.put("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

app.get("/account", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.status(200).json(customer)
});

// recuperar extrato bancário
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    // recupera o customer passado pelo middleware
    const { customer } = request;
    return response.json(customer.statement);
});

app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    const { date } = request.query;
    const formatDate = new Date(date + " 00:00"); // formata a data para pegar qualquer horario

    const statement = customer
        .statement
        .filter(c => c.created_at.toDateString() === new Date(formatDate).toDateString());

    return response.json(statement);
});

app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;
    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
});

app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount} = request.body;
    const { customer } = request;
    const balance = getBalance(customer.statement);

    if(balance < amount) 
        return response.status(400).json({error: "Saldo Insuficiente"});
    
        const statementOperation = {
            description,
            amount,
            created_at: new Date(),
            type: "debit"
        };
    
        customer.statement.push(statementOperation);
    
        return response.status(201).send();
});

app.listen(3333);