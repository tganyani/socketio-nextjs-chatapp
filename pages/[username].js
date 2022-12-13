import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import DoneAllIcon from "@mui/icons-material/DoneAll";
import DoneIcon from "@mui/icons-material/Done";
import styles from "../styles/ChatFrame.module.scss";
import baseUrl from "../helpers/baseurl";

const socket = io(`${baseUrl}`);

const Room = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [typingMsg, setTypingMsg] = useState("");
  const scrollMessage = useRef();
  const { username } = router.query;
  const roomName =
    session?.name.username < username
      ? "".concat(session?.name.username, username)
      : "".concat(username, session?.name.username);
 useEffect(()=>{
  const redirect = ()=>{
    if(!session){
      router.push('/')
    } 
  }
  redirect()
 },[])   
  useEffect(() => {
    socket.emit("joinroom", roomName);
  }, []);
  useEffect(()=>{
    const updateMsg= ()=>{
      if (Boolean(room)) {
        socket.emit("deliveredmsg", {
          roomName: roomName,
          roomId: room?.id,
          userId: session?.name.userId,
        });
        socket.on("updatedeliveredmsg", () => {
          const tempmsg = messages.map((msg) => {
            if (msg.userId === session?.name.userId) {
              return { ...msg, delivered: true };
            } else {
              return msg;
            }
          });
          setMessages(tempmsg);
        });
      }}
    updateMsg()
  })
  useEffect(() => {
    socket.on("roomMsg", (data) => {
      if(messages){
        setMessages([...messages, data]);
      }
    });
  });
  useEffect(() => {
    socket.on("user_typing", (data) => {
      setTypingMsg(data);
      setTimeout(() => {
        setTypingMsg("");
      }, 1000);
    });
  });
  useEffect(() => {
    const fetchRoom = async () => {
        await axios
          .get(
            `${baseUrl}/room?name=${roomName}&user=${session?.name.username}`
          )
          .then((res) => {
            setRoom(res.data[0]);
            setMessages(res.data[0]?.chats);
          });

      if (!Boolean(room)) {
        await axios.post(`${baseUrl}/newroom`, {
          name: roomName,
          users: [session?.name.userId, username],
        });
        await axios
          .get(
            `${baseUrl}/room?name=${roomName}&user=${session?.name.username}`
          )
          .then((res) => {
            setRoom(res.data[0]);
          });
      }
    };
    fetchRoom();
  }, [username, roomName]);
  useEffect(() => {
    scrollMessage.current?.scrollIntoView({ block: "end", behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await socket.emit("sendroomMsg", {
      roomName: roomName,
      roomId: room?.id,
      userId: session?.name.userId,
      message,
    });
    setMessage("");
  };
  
  return (
    session&&<div className={styles.main}>
      <div className={styles.topBar}>
        <p style={{ textAlign: "center" }}>
          You are chating with <span style={{ fontSize: "1em" }}>{username}</span>
        </p>
        <p style={{ color: "lawngreen", marginLeft: "15%" }}>{typingMsg}</p>
      </div>
      <div className={styles.submain}>
        <div className={styles.chatframe}>
          {messages?.map((msg, i) => (
            <div key={msg.id} style={{ width: "100%" }}>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  fontStyle: "italic",
                  color: "grey",
                }}
              >
                {new Date().getDate() - 1 ===
                  new Date(msg.created_at.split("T")[0]).getDate() &&
                messages[i - 1]?.created_at.split("T")[0] !==
                  msg.created_at.split("T")[0] ? (
                  "Yesterday"
                ) : new Date().toISOString().split("T")[0] ===
                    msg.created_at.split("T")[0] &&
                  messages[i - 1]?.created_at.split("T")[0] !==
                    msg.created_at.split("T")[0] ? (
                  "Today"
                ) : i !== 0 &&
                  messages[i - 1]?.created_at.split("T")[0] ===
                    msg.created_at.split("T")[0] ? (
                  " "
                ) : (
                  <div>
                    {String(new Date(msg.created_at.split("T")[0])).split(
                      " ",
                      1
                    )}{" "}
                    {
                      String(new Date(msg.created_at.split("T")[0])).split(
                        " "
                      )[1]
                    }{" "}
                    {
                      String(new Date(msg.created_at.split("T")[0])).split(
                        " "
                      )[2]
                    }{" "}
                    {
                      String(new Date(msg.created_at.split("T")[0])).split(
                        " "
                      )[3]
                    }
                  </div>
                )}
              </p>
              <div
                className={
                  msg.userId === session?.name.userId
                    ? styles.you
                    : styles.friend
                }
              >
                <div className={styles.msg}>{msg.message}</div>
                {msg.userId === session?.name.userId && (
                  <div className={styles.ticks}>
                    <p style={{ margin: "0" }}>
                      {msg.created_at.split("T")[1].split(".")[0]}
                    </p>
                    {!msg.delivered && (
                      <DoneIcon style={{ fontSize: "14px" }} />
                    )}
                    {msg.delivered && (
                      <DoneAllIcon
                        style={{ fontSize: "14px", color: "lawngreen" }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={scrollMessage}></div>
        </div>
        <div className={styles.chatInput}>
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              socket.emit("typing", {
                roomName: roomName,
                message: "typing ...... ",
              });
            }}
          />
          <button type="submit" onClick={handleSubmit}>
            send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;
