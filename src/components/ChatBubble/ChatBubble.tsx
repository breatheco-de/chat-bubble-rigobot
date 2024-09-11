import "@fontsource/lato";

import React, { useState, useEffect } from "react";

import { svgs } from "../../assets/svgs";
import { io, Socket } from "socket.io-client";
import { ChatBubbleProps, ChatMessagesProps } from "../../types";

function extractMovetoContent(text: string): {
  contentInside: string | null;
  textWithoutTags: string;
} {
  const movetoRegex = /<moveto>(.*?)<\/moveto>/;
  const match = text.match(movetoRegex);

  let contentInside = null;
  let textWithoutTags = text;

  if (match && match[1]) {
    contentInside = match[1];
    textWithoutTags = text.replace(movetoRegex, "");
  }

  return { contentInside, textWithoutTags };
}

const rootVariables = {
  activeColor: "#0084FF",
  successColor: "#25BF6C",
  softBlue: "#EEF9FE",
  lightGrey: "#DADADA",
  backgroundGreyLight: "#F9F9F9",
};

const chatStyles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    background: rootVariables.activeColor,
    borderTopLeftRadius: "10px",
    borderTopRightRadius: "10px",
    boxSizing: "border-box",
  },
  chatContainer: {
    width: "400px",
    borderRadius: "10px",
    boxShadow: "0 1px 5px rgba(0, 0, 0, 0.5)",
    maxHeight: "80vh",
    boxSizing: "border-box",
    fontFamily: "'Lato', sans-serif",
  },
  bubble: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "50px",
    height: "50px",
    background: rootVariables.activeColor,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  onlineCircle: {
    width: "10px",
    height: "10px",
    background: rootVariables.successColor,
    position: "absolute",
    border: "1px solid white",
    top: "70%",
    borderRadius: "50vh",
    left: "70%",
  },
  thumbnail: {
    position: "relative",
    border: "2px solid white",
    borderRadius: "50vh",
    padding: "4px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: rootVariables.activeColor,
  },
  messagesContainer: {
    padding: "16px",
    paddingBottom: "100px",
    overflowY: "scroll",
    height: "100%",
    boxSizing: "border-box",
    fontFamily: "'Lato', sans-serif",
    scrollbarWidth: "none",
  },
};

const getContainerPosition = (): object => {
  return {
    position: "fixed",
    bottom: "80px",
    right: "20px",
  };
};

const getBubbleStyles = (rootElement: Element) => {
  if (!rootElement) {
    return chatStyles.bubble;
  } else {
    const rect = rootElement.getBoundingClientRect();
    return {
      ...chatStyles.bubble,
      top: `${rect.bottom}px`, // Distancia entre el final del bloque y la parte superior de la ventana gráfica
      left: `${rect.left}px`,
    };
  }
};

const ChatMessages: React.FC<ChatMessagesProps> = ({
  user,
  host,
  purposeId,
  chatAgentHash,
  socketHost,
  closeChat,
  welcomeMessage,
  completions,
}) => {
  console.log(completions);

  const [messages, setMessages] = useState([
    { text: welcomeMessage, sender: "ai" },
    { text: "Hello bro", sender: "user" },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const newSocket = io(socketHost, { autoConnect: false });
    setSocket(newSocket);

    newSocket.connect();

    const onStartData = {
      token: user.token || chatAgentHash,
      purpose: purposeId,
      conversationId: conversationId,
    };

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("start", onStartData);
    });

    newSocket.on("response", (message) => {
      // console.log("received a response ", message);

      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;
        updatedMessages[lastMessageIndex].text += message.chunk;
        return updatedMessages;
      });
    });

    newSocket.on("responseFinished", (data) => {
      if (data.status === "ok") {
        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessageIndex = updatedMessages.length - 1;
          const message = updatedMessages[lastMessageIndex];
          const result = extractMovetoContent(message.text);
          updatedMessages[lastMessageIndex].text = result.textWithoutTags;
          console.log(result.contentInside);
          
          return updatedMessages;
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    initConversation();
  }, [host, purposeId, chatAgentHash, user.token]);

  const initConversation = async () => {
    const headers = {
      "Content-Type": "application/json",
      "Chat-Agent-Hash": chatAgentHash,
      Authorization: `Token ${user.token || chatAgentHash}`,
    };

    try {
      const res = await fetch(`${host}/v1/conversation/?purpose=${purposeId}`, {
        method: "POST",
        headers,
        body: null,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json = await res.json();
      setConversationId(json.conversation_id);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const createContext = () => {
    let innerContext = `
    This context is related to the user or the environment:
    """
    ${user.context}
    """

    Think about the following completions (if available) as a source of proven information about the website in general. If the user message can be answered using one of the following completions, return its answer.
    """
    ${JSON.stringify(completions)}
    """

    In the cases where you use one of the (always one at a time) please return inside an xml <moveto> like the follwing at the end of your response: 
    <moveto>DOMTarget</moveto>

    This will move the chat bubble where your answer are being displayed to an element the user should see. THIS IS MANDATORY is you are using information from the provided completions.
    Inside the XML tag must be DOMTarget selector is provided. Else please do not add the XML tag.
    `;
    console.log("CONTEXT TO QUERY: ", innerContext);

    return innerContext;
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && socket) {
      const messageData = {
        message: {
          type: "user",
          text: inputValue,
          context: createContext(),
        },
        conversation: {
          id: conversationId,
          purpose: purposeId,
          token: chatAgentHash,
        },
      };

      socket.emit("message", messageData);

      setMessages([
        ...messages,
        { text: inputValue, sender: "person" },
        { text: "", sender: "ai" },
      ]);

      setInputValue("");
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "500px",
        paddingBottom: "100px",
        overflowY: "hidden",
      }}
    >
      {/* @ts-ignore */}
      <div style={chatStyles.header}>
        <section>
          <RigoThumbnail withOnline={true} />
        </section>
        <section>
          <span onClick={closeChat}>{svgs.cancel}</span>
        </section>
      </div>
      {/* @ts-ignore */}
      <div className="chat-messages" style={chatStyles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            style={{
              background: "",
              color: "black",
              display: "flex",
              gap: "6px",
              marginBottom: "10px",
              alignItems: "center",

              flexDirection: `${
                message.sender === "ai" ? "row" : "row-reverse"
              }`,
            }}
          >
            {message.sender === "ai" ? (
              <>
                <RigoThumbnail />
                <div
                  style={{
                    color: rootVariables.activeColor,
                    background: rootVariables.softBlue,
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {message.text}
                </div>
              </>
            ) : (
              <>
                <div>{svgs.person}</div>
                <div
                  style={{
                    color: "black",
                    background: `#F5F5F5`,
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {message.text}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div
        style={{
          background: rootVariables.softBlue,
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          position: "absolute",
          bottom: "0",
          width: "100%",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
          boxSizing: "border-box",
        }}
      >
        <input
          type="text"
          placeholder="Ask Rigobot..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyUp={handleKeyUp}
          style={{
            padding: "10px",
            width: "100%",
            borderRadius: "11px",
            border: `1px solid ${rootVariables.lightGrey}`,
            color: "black",
            outline: `1px solid ${rootVariables.lightGrey}`,
          }}
        />
        <span onClick={handleSendMessage}>{svgs.send}</span>
      </div>
    </div>
  );
};

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  user,
  welcomeMessage,
  host,
  purposeId,
  chatAgentHash,
  socketHost,
  collapsed,
  originElement,
  introVideoUrl,
  completions,
}) => {
  const [isChatVisible, setIsChatVisible] = useState(collapsed);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  return (
    <>
      {/* @ts-ignore  */}
      <div style={getBubbleStyles(originElement)} onClick={toggleChat}>
        <RigoThumbnail />
      </div>

      {isChatVisible && introVideoUrl && (
        <div
          style={{
            ...getContainerPosition(),
            display: "flex",
            background: rootVariables.backgroundGreyLight,
            padding: "8px",
            gap: "16px",
            borderRadius: "10px",
          }}
        >
          <VideoDisplay videoSrc={introVideoUrl} />
          {/* @ts-ignore */}
          <div style={chatStyles.chatContainer}>
            <ChatMessages
              user={user}
              host={host}
              purposeId={purposeId}
              chatAgentHash={chatAgentHash}
              socketHost={socketHost}
              closeChat={toggleChat}
              welcomeMessage={welcomeMessage}
              completions={completions}
            />
          </div>
        </div>
      )}
      {isChatVisible && !introVideoUrl && (
        // @ts-ignore
        <div style={{ ...chatStyles.chatContainer, ...getContainerPosition() }}>
          <ChatMessages
            user={user}
            host={host}
            purposeId={purposeId}
            chatAgentHash={chatAgentHash}
            socketHost={socketHost}
            closeChat={toggleChat}
            welcomeMessage={welcomeMessage}
            completions={completions}
          />
        </div>
      )}
    </>
  );
};

const RigoThumbnail = ({ withOnline = false }) => {
  return (
    // @ts-ignore
    <div style={chatStyles.thumbnail}>
      {svgs.rigoSvg}
      {withOnline && (
        <div
          // @ts-ignore
          style={chatStyles.onlineCircle}
        ></div>
      )}
    </div>
  );
};

const VideoDisplay = ({ videoSrc }: { videoSrc: string }) => {
  const isYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(url);
  };

  const getYouTubeId = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  if (isYouTubeUrl(videoSrc)) {
    const videoId = getYouTubeId(videoSrc);
    return (
      <div style={{ flexGrow: 1 }}>
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    );
  }

  return (
    <div>
      <video src={videoSrc} controls></video>
    </div>
  );
};
