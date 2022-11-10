import express, {Response, Request} from 'express'
import cors from 'cors'
import { userAccounts } from './data'

const app = express()
app.use(express.json())
app.use(cors())

//Teste
app.get("/teste", (req: Request, res: Response) => {
    res.status(400).send('Teste')
})

app.post("/users", (req: Request, res: Response) => {
    const {name, cpf, dateOfBirth} = req.body
    let errorCode = 400

    try {

        if (!name) {
            errorCode = 422
            throw new Error("Informe o seu nome completo.");
        }

        if (!cpf) {
            errorCode = 422
            throw new Error("Informe o seu CPF.");
        }

        if (!dateOfBirth) {
            errorCode = 422
            throw new Error("Informe a sua data de nascimento no padrão DD/MM/AAAA.");
        }

        userAccounts.forEach((user) => {
            if (user.cpf === cpf) {
                errorCode = 409
                throw new Error("CPF já existente no banco de dados.");  
            }
        })

        const birthDateArray = dateOfBirth.split("/").map(Number)
        let minimumBirthDate = new Date(birthDateArray[2] + 18, birthDateArray[1] - 1, birthDateArray[0])
        let today = new Date()
        if (minimumBirthDate > today) {
            errorCode = 403
            throw new Error("Idade mínima de 18 anos não alcançada.");
        }

        const newUser = {
            name,
            cpf,
            dateOfBirth,
            balance: 0,
            statement: []
        }

        userAccounts.push(newUser)

        res.status(201).send(newUser)
        
    } catch (err:any) {
        res.status(errorCode).send(err.message)
    }
})

app.post("/users/payment", (req: Request, res: Response) => {
    const userCpf = req.headers.cpf as string
    const {value, date, description} = req.body
    let errorCode = 400

    try {
        
        if (!userCpf) {
            errorCode = 403
            throw new Error("Informe seu CPF para continuar.");
        }

        const getUser = userAccounts.find(user => user.cpf === userCpf)

        if (!getUser) {
            errorCode = 401
            throw new Error("Usuário não encontrado no banco de dados.");
        }

        if (value === 0) {
            errorCode = 422
            throw new Error("O valor da conta não pode ser nulo.");
        }

        if (value > getUser.balance) {
            errorCode = 401
            throw new Error("Saldo insuficiente.");
        }

        if (!description) {
            errorCode = 422
            throw new Error("Adicione uma descrição para esta transação.");
        }

        let paymentDate: string

        if (!date) {
            const today = new Date()
            const day = today.getDate();
            const month = (today.getMonth() > 9 ? `${today.getMonth() + 1}` : `0${today.getMonth() + 1}`);
            const year = today.getFullYear();
            paymentDate = `${day}/${month}/${year}`
        } else {
            paymentDate = date
        }

        const payment = {
            value,
            date: paymentDate,
            description
        }

        getUser.statement.push(payment)

        res.status(201).send(getUser)

    } catch (err:any) {
        res.status(errorCode).send(err.message)
    }
})


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003")
})