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


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003")
})