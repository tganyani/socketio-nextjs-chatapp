import { useSession, signIn, signOut } from "next-auth/react"
import styles from '../styles/Home.module.scss'
import Link from "next/link"

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
      </div>
    </div>
  )
}