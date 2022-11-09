import express, {Response, Request} from 'express'
import cors from 'cors'

const app = express()
app.use(express.json())
app.use(cors())

//Teste
app.get("/teste", (req: Request, res: Response) => {
    res.status(400).send('Teste')
})


app.listen(3003, () => {
    console.log("Server is running in http://localhost:3003")
})