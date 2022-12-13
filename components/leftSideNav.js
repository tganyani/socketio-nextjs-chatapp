import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { useRouter } from 'next/router'

import { io } from "socket.io-client";
import baseUrl from "../helpers/baseurl";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import styles from "../styles/LeftSideNav.module.scss";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import ChatIcon from "@mui/icons-material/Chat";
import axios from "axios";

const socket = io(`${baseUrl}`);

export default function LeftSideNav() {
  const { data: session } = useSession();
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState(null);
  const [onlineUserId, setOnlineUserId] = useState();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([])
  const [chatTab, setChatTab] = useState(true);
  const [userTab, setUserTab] = useState(false);
  const [winWidth, setWinWidth] = useState(globalThis.window?.innerWidth);

  useEffect(() => {
    socket.emit("online", { userId: session?.name.userId });
    socket.on("online_user", ({ userId }) => {
      setOnlineUserId(Number(userId));
    });
  });
  useEffect(() => {
    const fetchData = async () => {
      await axios.get(`${baseUrl}/users`).then((res) => {
        setUsers(res.data);
      });
      if(session?.name.userId){
        await axios.get(`${baseUrl}/roomsin?id=${session?.name.userId}&name=${session?.name.username}`).then((res) => {
          setChats(res.data);
        });
      }
    };
    fetchData();
  },[chatTab,userTab]);
  useEffect(() => {
    const handleWindowResize = () => setWinWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);

    // Return a function from the effect that removes the event listener
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);
  useEffect(() => {
    const tempUsers = users.map((user) => {
      if (user.id === Number(onlineUserId)) {
        return {
          ...user,
          online: true,
        };
      } else {
        return user;
      }
    });
    setUsers(tempUsers);
  }, [onlineUserId]);

  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    session && (
      <div className={styles.main}>
        <div className={styles.submain1}>
          <div className={styles.userIcon}>
            <PeopleAltIcon
              onClick={() => {
                setUserTab(true);
                setChatTab(false);
              }}
              style={{ color: userTab ? "lawngreen" : "#1E90FF" }}
            />
          </div>
          <div className="">
            <ChatIcon
              onClick={() => {
                setUserTab(false);
                setChatTab(true);
              }}
              style={{ color: chatTab ? "lawngreen" : "#1E90FF" }}
            />
          </div>
          <div>
            <Button
              id="basic-button"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
            >
              <AccountCircleIcon style={{ color: "#1E90FF" }} />
              {session?.name.username}
            </Button>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "basic-button",
              }}
            >
              <MenuItem onClick={handleClose}>Profile</MenuItem>
              <MenuItem onClick={handleClose}>My account</MenuItem>
              <MenuItem
                style={{ color: "red" }}
                onClick={() => {
                  signOut();
                  handleClose();
                  router.push({pathname:"/"})
                }}
              >
                Logout
              </MenuItem>
            </Menu>
          </div>
        </div>
        {userTab && (
          <div className={styles.submain2}>
            <div className={styles.searchbar}>
              <div className={styles.inputSearch}>
                <input type="text" placeholder="search user" />
              </div>
            </div>
            <div className={styles.userlist}>
              {users?.map((user) => (
                <Link
                  href={`/${user.username}`}
                  key={user.id}
                  onClick={() => {
                    if (Number(winWidth) <= 600) {
                      setUserTab(false);
                    }
                  }}
                >
                  <li>
                    <AccountCircleIcon />
                    <div>
                      { (user.id===session?.name.userId)?"You":user.username}
                      {user.online && (
                        <p style={{ color: "lightgreen" }}>online</p>
                      )}
                    </div>
                  </li>
                </Link>
              ))}
            </div>
          </div>
        )}
        {chatTab && (
          <div className={styles.submain2}>
            <div className={styles.searchbar}>
              <div className={styles.inputSearch}>
                <input type="text" placeholder="search chats" />
              </div>
            </div>
            <div className={styles.userlist}>
              {chats?.map((chat) => (
                <Link
                  href={(chat.users[0]?.id===session?.name.userId)?(`/${session?.name.username}`):`/${chat.users[0]?.username}`}
                  key={chat.users[0]?.id}
                  onClick={() => {
                    if (Number(winWidth) <= 600) {
                        setChatTab(false);
                      }
                  }}
                >
                  <li>
                    <AccountCircleIcon />
                    <div>
                      {(chat.users[0]?.id===session?.name.userId)?"You":chat.users[0]?.username}{" "}
                      {chat.users[0]?.online && (
                        <p style={{ color: "lightgreen" }}>online</p>
                      )}
                    </div>
                  </li>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  );
}
