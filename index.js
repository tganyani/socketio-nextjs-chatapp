import express from 'express'
import cors from 'cors'
import {createServer} from 'http'
import { Server } from 'socket.io'

const app = express()
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods:['GET','POST']
    }
})
var messages = ['hello','world']
io.on("connection", (socket)=>{
    console.log(socket.id)
    // io.emit('greet',messages)
    socket.on('newmessage',(data)=>{
       messages.push(data)
       io.emit('newmsg', messages)
       console.log(data)
    })
})

httpServer.listen(5000,()=>console.log('The server is app and running on port 5000'))