
import axios from 'axios'
import { useState } from 'react'
import styles from '../styles/SignUp.module.scss'

export default function(){
    const [userToCreate, setUserToCreate] = useState({
        username:"",
        password:""
    })
    const handleSubmit = async(e)=>{
        e.preventDefault()
        await axios.post('https://backend-chat-app-l03g.onrender.com/newuser', userToCreate)
    }
    return(
        <div className={styles.main}>
            <div className={styles.submain}>
                <label>
                    username
                </label>
                <input type="text" onChange={e=>setUserToCreate({...userToCreate,username:e.target.value})}/>
                <label>
                    password
                </label>
                <input type="password"  onChange={e=>setUserToCreate({...userToCreate,password:e.target.value})}/>
                <button onClick={handleSubmit} type="submit">submit</button>
            </div>
        </div>
    )
}