import { useSession, signIn, signOut } from "next-auth/react"
import styles from '../styles/Home.module.scss'
import Link from "next/link"

<<<<<<< HEAD
export default function Component() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className={styles.submain2}>
        <div>
          <h3>You can click on any of the users and start communicating</h3>
          Signed in as {session.name.username} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      </div>
    )
  }
  return (
    <div className={styles.main}>
      <div className={styles.submain}>
        <h3> welcome to our chat app</h3>
       <button onClick={() => signIn()}>Sign in</button>
       <p>if you dont have an account</p>
       <Link href="/signup">Register</Link>
=======
const socket = io("https://mychat-a.herokuapp.com/")


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
>>>>>>> 1b9007b42980aa19bcfa7bbdedaf383dda83bd3e
      </div>
    </div>
  )
}