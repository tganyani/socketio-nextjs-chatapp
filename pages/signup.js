
import axios from 'axios'
import { useState } from 'react'
import styles from '../styles/SignUp.module.scss'
import Link from 'next/link'
import baseUrl from '../helpers/baseurl'

export default function(){
    const [userToCreate, setUserToCreate] = useState({
        username:"",
        password:""
    })

    const handleSubmit = async(e)=>{
        e.preventDefault()
        await axios.post(`${baseUrl}/newuser`, userToCreate)
        .then(res=>{
           alert(res.data.msg)
        })
    }
    return(
        <div className={styles.main}>
            <div className={styles.submain}>
                <h3>Create account</h3>
                <label>
                    username
                </label>
                <input type="text" onChange={e=>setUserToCreate({...userToCreate,username:e.target.value})}/>
                <label>
                    password
                </label>
                <input type="password"  onChange={e=>setUserToCreate({...userToCreate,password:e.target.value})}/>
                <button onClick={handleSubmit} type="submit">Sign Up</button>
                <p>Do you have an account?</p>
                <Link href="/api/auth/signin"><button style={{width:"100%"}}>Sign In</button></Link>
            </div>
        </div>
    )
}