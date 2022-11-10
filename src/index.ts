import express, {Response, Request} from 'express'
import cors from 'cors'
import { userAccounts } from './data'

const app = express()
app.use(express.json())
app.use(cors())

// Teste

app.get("/teste", (req: Request, res: Response) => {
    res.status(400).send('Teste')
})

// Create Bank Account 

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


// "Get All Users"

app.get("/users", (req: Request, res: Response)=>{

    let errorCode= 400

    try{
        res.status(200).send(userAccounts)
    }catch(e: any){
        res.status(errorCode).send(e.message)
    }
})

// Get Account Balance

app.get("/users/balance",(req: Request, res: Response)=>{

    const name = req.headers.name as string
    const cpf = req.headers.cpf as string
    let errorCode= 400
    let userBalance
    
    try{

        if(!name && !cpf){
            errorCode= 422
            throw new Error("É obrigatório informar o nome completo e o CPF para consultar seu saldo.")
        }
        
        if(!name){
            errorCode= 422
            throw new Error("Informe o seu nome completo.")            
        }
        
        if(!cpf){
            errorCode= 422
            throw new Error("Informe o seu CPF.")            
        } 
        
        const userExisting = userAccounts.filter((user)=>{
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
                return user
            }
        })

        if(userExisting.length === 0){
            errorCode= 422
            throw new Error("Usuário não encontrado.")            
        }

        for(let user of userAccounts){
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
               userBalance = user.balance
            }
        }
        
        res.status(200).send(`${userBalance}`)        

    }catch(e: any){
        res.status(errorCode).send(e.message)
    }
})

// Add Balance

app.patch("/users/add/balance",(req: Request, res: Response)=>{

    const name = req.headers.name as string
    const cpf = req.headers.cpf as string
    const valueToAdd = Number(req.body.valueToAdd)
    let newUserBalance
    let errorCode= 400

    try{

        if(!name && !cpf && !valueToAdd){
            errorCode= 422
            throw new Error("É obrigatório informar o nome completo, o CPF e o valor que você deseja adicionar.")
        }        
        
        if(!name){
            errorCode= 422
            throw new Error("Informe o seu nome completo.")            
        }
        
        if(!cpf){
            errorCode= 422
            throw new Error("Informe o seu CPF.")            
        }

        if(!valueToAdd){
            errorCode= 422
            throw new Error("Informe o valor que você deseja adicionar.")
        }

        const userExisting = userAccounts.filter((user)=>{
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
                return user
            }
        })

        if(userExisting.length === 0){
            errorCode= 422
            throw new Error("Usuário não encontrado.")            
        }

        for(let user of userAccounts){
            if(user.name.toLowerCase() === name.toLowerCase() && user.cpf === cpf){
               newUserBalance = user.balance + valueToAdd
            }
        }

        res.status(200).send(`${newUserBalance}`)  

    }catch(e: any){
        res.status(errorCode).send(e.message)
    } 

})  


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003")
})