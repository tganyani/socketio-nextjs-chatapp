import { SessionProvider } from "next-auth/react"
import styles from  '../styles/Main.module.scss'
import LeftSideNav from "../components/leftSideNav"
import '../styles/globals.css'

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return(
    <SessionProvider session={session}>
      <div  className={styles.app}>
        <LeftSideNav/>
        <Component {...pageProps}  />
      </div>
    </SessionProvider>
  )
}

export default MyApp
