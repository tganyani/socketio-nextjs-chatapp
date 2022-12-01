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
        </div>
      </div>
    )
  }
  return (
    <div className={styles.main}>
      <div className={styles.submain}>
        <h3> welcome to our chat app</h3>
       <button onClick={() => signIn()}>Sign in</button>
       <p>Do you have an account?</p>
       <button><Link href="/signup">Register</Link></button>
      </div>
    </div>
  )
}