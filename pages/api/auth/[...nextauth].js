import NextAuth from "next-auth/next";
import CredentialsProvider  from "next-auth/providers/credentials";
import axios from 'axios'

export default NextAuth({
    providers:[
        CredentialsProvider({
            name: "username and password",
            credentials:{
                username:{
                    label:"username",
                    type: "text"
                },
                password: {
                    label: "password",
                    type: "password"
                }
            },
            authorize: async({username, password})=>{
                const user =  await axios.get(`https://backend-chat-app-l03g.onrender.com/user?username=${username}`)
                        .then(res => res.data)
                if (user && user.password === password){
                    return {
                        "name": {
                            username,
                            userId: user.id
                        }
                    }
                }
                return null
            }
        })
    ],
    secret: process.env.NEXT_PUBLIC_SECRET
    ,
    callbacks: {
        async session({session}) {
          return session.user
        }
      }
})
