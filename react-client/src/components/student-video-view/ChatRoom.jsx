import React from "react";
import axios from "axios";
import io from "socket.io-client";
import moment from "moment";
window.io = io;

class ChatRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      messages: []
    };
    this.socket = null;
    this.postMessage = this.postMessage.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.connectSocket = this.connectSocket.bind(this);
    this.loadChats = this.loadChats.bind(this);
  }

  componentDidMount() {
    this.connectSocket();
    this.loadChats();
  }

  connectSocket() {
    this.socket = window.io.connect("http://localhost:3000");
    this.socket.on("new message", data => {
      this.setState(
        {
          messages: [...this.state.messages, JSON.parse(data.msg)]
        },
        () => {
          document.getElementById("message").value = "";
        }
      );
    });
  }

  loadChats() {
    axios.get('/chats', {
      params: {
        videoId: this.props.videoId
      }
    })
    .then((data) => {
      console.log('data in index.jsx from get chats', data)
    })
  }

  postMessage() {
    this.socket.emit("send message", {
      msg: this.state.message,
      user: this.props.username,
      videoId: this.props.videoId
    });
    // send post req with message, user, videoId, timestamp to server
    axios.post("/chats", {
      userId: this.props.userId,
      username: this.props.username,
      timestamp: moment().format("llll"),
      videoId: this.props.videoId, 
      text: this.state.message
    })
    .then(() => {
      console.log('posted message from chatroom.jsx to server')
    })
    .catch((err) => {
      console.log('ERROR IN CHATROOM.JSX POSTMESSAGE: ', err);
    })
  }

  changeHandler(e) {
    this.setState({
      message: e.target.value
    });
  }

  render() {
    return (
      <div style={chatroomStyle}>
        <div style={msgContainerStyle}>
          <div style={overflowStyle}>
            {this.state.messages.map((message, idx) => {
              let timestamp = moment().format("llll");
              if (message.videoId === this.props.videoId) {
                return (
                  <div key={idx} style={messageStyle}>
                    {message.user}: {message.msg}
                    <div style={timestampStyle}> {timestamp}</div>
                  </div>
                );
              }
            })}
          </div>
        </div>
        <div style={inputContainerStyle}>
          <input
            value={this.state.message}
            onChange={this.changeHandler}
            style={inputStyle}
            id="message"
            autoComplete="off"
          />
          <button style={buttonStyle} onClick={this.postMessage}>
            Send
          </button>
        </div>
      </div>
    );
  }
}

const chatroomStyle = {
  margin: "0",
  padding: "0",
  boxSizing: "border-box",
  font: "13px Helvetica, Arial",
  border: "5px black solid"
};

const inputContainerStyle = {
  background: "#000",
  bottom: "0",
  width: "100%"
};

const inputStyle = {
  border: "0",
  padding: "10px",
  width: "93%"
};

const buttonStyle = {
  width: "17%",
  background: "rgb(130, 224, 255)",
  border: "none",
  padding: "10px"
};

const msgContainerStyle = {
  border: "1px black solid",
  height: "40vh"
};

const messageStyle = {
  paddingLeft: "10px",
  textAlign: "left"
};

const overflowStyle = {
  overflowY: "auto",
  height: "100%"
};

const timestampStyle = {
  font: "9px Helvetica, Arial",
  fontStyle: "italic",
  color: "#D3D3D3"
};

export default ChatRoom;
