import { useRouter } from 'next/router'
import { useSession} from "next-auth/react"
import { useEffect, useState } from 'react'
import axios from 'axios'
import {io} from 'socket.io-client'

import styles from '../styles/ChatFrame.module.scss'

const socket = io("https://backend-chat-app-l03g.onrender.com")


const Room = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [room, setRoom] = useState({})
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const { username } = router.query
  const roomName =  session?.name.username < username ?"".concat(session?.name.username,username): "".concat(username,session?.name.username)
  
  useEffect(()=>{
      socket.on('roomMsg',(data)=>{
          console.log(data)
          setMessages([...messages,data])
        })
  },[message,socket])
  useEffect(() =>{
    const fetchRoom = async ()=>{
      await axios.get(`https://backend-chat-app-l03g.onrender.com/room?name=${roomName}`)
      .then(res=>{
        setRoom(res.data[0])
        setMessages(res.data[0]?.chats)
      })
      if(!room){
        await axios.post('https://backend-chat-app-l03g.onrender.com/newroom',{name:roomName})
        await axios.get(`https://backend-chat-app-l03g.onrender.com/room?name=${roomName}`).then(res=>setRoom(res.data[0]))
      }
      
    }
    fetchRoom()
  },[roomName,message])
  const handleSubmit = async (e)=>{
    e.preventDefault()
    await socket.emit('sendroomMsg',{roomName:roomName,roomId:room.id,userId:session?.name.userId,message})
  }
  if(!messages) return <p>Loading......!</p>

  return (
    <div className={styles.main}>
      <div className={styles.topBar}>
        Room:{roomName}
      </div>
     <div className={styles.submain}>
      <div className={styles.chatframe}>
          {
            messages.map((msg,i) => (
              <div key={i} className={msg.userId === session?.name.userId ? styles.you: styles.friend}>
                <p>{msg.message}</p>
              </div>
            ))
          }
        </div>
        <div className={styles.chatInput}>
          <input
            type="text"
            onChange={e => setMessage(e.target.value)}
          />
          <button
            type='submit'
            onClick={handleSubmit}
          >
            send
          </button>
        </div>
      </div>
    </div>
  )
}

export default Room