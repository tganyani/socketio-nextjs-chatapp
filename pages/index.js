import {useEffect, useState} from 'react'
import Head from 'next/head'
import Image from 'next/image'
import {io} from 'socket.io-client'
import styles from '../styles/Home.module.css'

const socket = io("http://localhost:5000")


export default function Home() {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  useEffect(()=>{
    // socket.on('greet',(data)=>{
    //   setMessages(data)
    //   console.log(data)
    // })
    socket.on('newmsg',(data)=>{
      console.log(data)
      setMessages(data)
    })
  },[])
  const handleSubmit = async (e)=>{
    e.preventDefault()
    await socket.emit('newmessage',message)
  }
  return (
    <div className={styles.container}>
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
      <div>
        {
          messages.map((msg,i) => (
            <p key={i}>{msg}</p>
          ))
        }
      </div>
    </div>
  )
}
