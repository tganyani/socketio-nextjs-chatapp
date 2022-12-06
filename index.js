import express from 'express'
import cors from 'cors'
import {createServer} from 'http'
import { Server } from 'socket.io'
import prisma from './lib/prisma.js'

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))

app.get('/user/:id',async (req,res)=>{
    try {
        const user = await prisma.user.findUnique({
            where: {
              id: Number(req.params.id),
            }
          })
        res.json(user)
    } catch (err) {
        console.error(err)
    }
})
app.get('/user',async (req, res) =>{
    try {
        const user = await prisma.user.findMany({
            where: {
              username: req.query.username,
            },
          })
        res.json(user[0])
    } catch (err) {
        console.error(err)
    }
})
app.get('/users',async (req, res) =>{
    try {
        const users = await prisma.user.findMany()
        res.json(users)
    } catch (err) {
        console.error(err)
    }
})
app.get('/room',async (req, res) =>{
    try {
        const room = await prisma.room.findMany({
            where: {
              name: req.query.name,
            },
            include: {
                users:{
                    where:{
                        NOT:{
                            username:req.query.user
                        }
                    }
                },
                chats:{
                    orderBy: {
                        id: 'asc',
                      },
                },
              },
          })
        res.json(room)
    } catch (err) {
        console.error(err)
    }
})
app.get('/roomsin',async(req, res)=>{
    try {
        const rooms = await prisma.user.findUnique({
           where:{
            id: Number(req.query.id)
           },
           select:{
            rooms_in:{
                include:{
                    users:{
                        where:{
                            NOT:{
                                username:req.query.name
                            }
                        }
                    },
                }
            }
           }
        })
        res.json(rooms. rooms_in)
    } catch (err) {
        console.error(err)
    }
})
app.post('/newuser',async(req, res)=>{
    try {
        const user = await prisma.user.create({
            data: {
              username: req.body.username,
              password: req.body.password
          }})
          res.json({
            msg:"Account successfully created"
          })
       } catch (err) {
        console.log(err)
        res.json({
            msg:"could not successfully create your account"
        })
       }
})
app.post('/newroom', async(req, res)=>{
    console.log(req.body)
   try {
    const createdRoom = await prisma.room.create({
        data: {
          name: req.body.name,
          users: {
            connect: [
                {id:Number(req.body.users[0])},
                {username:req.body.users[1]},
            ],
          },
        },
      })
      res.json(createdRoom)
   } catch (err) {
    console.log(err)
   }
})

const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods:['GET','POST']
    }
})

io.on("connection", (socket)=>{
    console.log(socket.id)
    
    socket.on('sendroomMsg',async(data)=>{
        const createMsg = await prisma.chat.create({
            data:{
                message: data.message,
                userId: data.userId,
                roomId: data.roomId
            }
        })
        console.log(createMsg)
        io.to(data.roomName).emit("roomMsg",createMsg)
    })
    socket.on('joinroom',(data)=>{
        socket.join(data)
    })
    socket.on('online',(data)=>{
        io.emit('online_user',data)
    })
    socket.on('typing',(data)=>{
        socket.join(data.roomName)
        socket.to(data.roomName).emit("user_typing", data.message)
    })
    socket.on('deliveredmsg',async(d)=>{
        console.log(d)
        await prisma.room.update({
            where:{
                id:Number(d.roomId),
            },
            data:{
                chats:{
                    updateMany:{
                        where:{
                            NOT:{
                                userId:Number(d.userId)
                            }
                        },
                        data:{
                            delivered:true,
                        }
                    }
                }
            }
        })
        socket.join(d.roomName)
        socket.to(d.roomName).emit("updatedeliveredmsg")
    })
})

const port = process.env.PORT || 5000

httpServer.listen(port,()=>console.log('The server is app and running on port 5000'))


