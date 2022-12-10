import { useRouter } from 'next/router'
import { useSession} from "next-auth/react"
import { useEffect, useRef, useState } from 'react'
import axios from 'axios'
import {io} from 'socket.io-client'

import styles from '../styles/ChatFrame.module.scss'
import baseUrl from '../helpers/baseurl'

const socket = io(`${baseUrl}`)

const Room = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const [room, setRoom] = useState({})
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [typingMsg, setTypingMsg] = useState("")
  const scrollMessage = useRef()
  const { username } = router.query

  const roomName =  session?.name.username < username ?"".concat(session?.name.username,username): "".concat(username,session?.name.username)
  useEffect(()=>{
    socket.emit('joinroom',roomName)
  },[])

  useEffect(()=>{
      socket.on('roomMsg',(data)=>{
          console.log(data)
          setMessages([...messages,data])
        })
  })
  useEffect(()=>{
    socket.on('user_typing',(data)=>{
      setTypingMsg(data)
      setTimeout(() => {
        setTypingMsg("")
      }, 1000)
    })
  })
  useEffect(() =>{
    const fetchRoom = async ()=>{
      await axios.get(`${baseUrl}/room?name=${roomName}`)
      .then(res=>{
        setRoom(res.data[0])
        setMessages(res.data[0]?.chats)
      })
      if(!room){
        await axios.post(`${baseUrl}/newroom`,{name:roomName})
        await axios.get(`${baseUrl}/room?name=${roomName}`).then(res=>setRoom(res.data[0]))
      }
      
    }
    fetchRoom()
  },[username,roomName])
  useEffect(() => {
    scrollMessage.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
},[messages]);
  const handleSubmit = async (e)=>{
    e.preventDefault()
    await socket.emit('sendroomMsg',{roomName:roomName,roomId:room.id,userId:session?.name.userId,message})
    setMessage("")
  }
  return (
    <div className={styles.main}>
      <div className={styles.topBar}>
       <p style={{textAlign:"center"}}>You chating with <span style={{fontSize:"1em"}}>{username}</span></p> 
       <p style={{color:"lawngreen", marginLeft:"15%"}}>{typingMsg}</p>
      </div>
     <div className={styles.submain}>
      <div className={styles.chatframe}>
          {
            messages?.map((msg) => (
              <div key={msg.id} className={(msg.userId === session?.name.userId)? (styles.you):(styles.friend)}>
                <div>
                {msg.message}
                </div>
              </div>
            ))
          }
          <div ref={scrollMessage}>

          </div>
        </div>
        <div className={styles.chatInput}>
          <input
            type="text"
            value={message}
            onChange={e => {
              setMessage(e.target.value)
              socket.emit('typing',{roomName:roomName,message:"typing ...... "})
            }
            }
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