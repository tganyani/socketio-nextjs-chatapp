import { use, useEffect, useState } from "react"
import useSWR from 'swr'
import Link from "next/link"
import { useSession} from "next-auth/react"
import { signOut } from "next-auth/react"

import {io} from 'socket.io-client'
import baseUrl from '../helpers/baseurl'

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import styles from '../styles/LeftSideNav.module.scss'
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function LeftSideNav(){
    const socket = io(`${baseUrl}`)
    const { data: session } = useSession()
    const { data, error } = useSWR(`${baseUrl}/users`, fetcher)
    const [anchorEl, setAnchorEl] = useState(null);
    const [toggleuser , setToggleuser] = useState(false)
    const [onlineUserId , setOnlineUserId] = useState()
    useEffect(()=>{
        socket.emit('online',{userId:session?.name.userId})
        socket.on('online_user',({userId})=>{
           setOnlineUserId(Number(userId))
        })
        console.log(data)
    },[socket])
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    if(!data){
        return <p>Loading ...........!</p>
    }
    if(error){
        return <p>Error .......</p>
    }
    return(
        session && (<div className={styles.main}>
            <div className={styles.submain1}>
                <div className={styles.userIcon}>
                    <PeopleAltIcon onClick={()=>setToggleuser(!toggleuser)} style={{color:"skyblue"}}/>
                </div>
                <div>
                    <Button
                        id="basic-button"
                        aria-controls={open ? 'basic-menu' : undefined}
                        aria-haspopup="true"
                        aria-expanded={open ? 'true' : undefined}
                        onClick={handleClick}
                    >
                        <AccountCircleIcon/>
                        {session?.name.username}
                    </Button>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                        'aria-labelledby': 'basic-button',
                        }}
                    >
                        <MenuItem onClick={handleClose}>Profile</MenuItem>
                        <MenuItem onClick={handleClose}>My account</MenuItem>
                        <MenuItem style={{color:"red"}} onClick={()=>{
                            signOut()
                            handleClose()
                        }}>
                            Logout
                        </MenuItem>
                    </Menu>
                </div>
                    
            </div>
            <div className={ !toggleuser? styles.submain2: styles.toggleuser}>
                <div className={styles.searchbar}>
                    <div className={styles.inputSearch}>
                        <input type="text" placeholder="search user"/>
                    </div>
                </div>
                <div className={styles.userlist}>
                    {
                        data.map(user=>{
                            if(user.id === Number(onlineUserId)){
                                return{
                                    ...user,online:true
                                }
                            }
                            else{
                                return user
                            }
                        }).map(user=>(
                        <Link href={`/${user.username}`} key={user.id} onClick={()=>setToggleuser(false)}>
                            <li >
                                <AccountCircleIcon/>
                                <div>
                                {user.username} {user.online&&(<p style={{color:"lightgreen"}}>online</p>)}
                                </div>
                            </li>
                            
                        </Link>
                        ))
                    }
                </div>
            </div>
        </div>)
    )
}

