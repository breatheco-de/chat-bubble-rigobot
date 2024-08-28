import React, { useState, useEffect } from "react";
import styles from "./ChatBubble.module.css";
import { svgs } from "../../assets/svgs";
import { io, Socket } from "socket.io-client";

interface ChatHomeProps {
  setActiveSection: (section: string) => void;
  welcomeMessage: string;
}

const ChatHome: React.FC<ChatHomeProps> = ({
  setActiveSection,
  welcomeMessage,
}) => {
  return (
    <div>
      <div className={styles.header}>
        <h2>{welcomeMessage}</h2>
      </div>
      <div
        className={styles.askQuestion}
        onClick={() => setActiveSection("Messages")}
      >
        <p>Ask a question</p>
      </div>
    </div>
  );
};

const ChatFAQ = () => {
  return (
    <div>
      <div className={styles.header}>
        <h2>Help</h2>
        <input
          type="text"
          placeholder="Search articles..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.articles}>
        <div className={styles.article}>Article 1: How to use the chat</div>
        <div className={styles.article}>
          Article 2: Troubleshooting common issues
        </div>
        <div className={styles.article}>Article 3: Contact support</div>
      </div>
    </div>
  );
};

interface ChatMessagesProps {
  aiImageUrl: string;
  userImageUrl: string;
  host: string;
  purposeId: number;
  chatAgentHash: string;
  rigoUserToken?: string;
  socketHost: string; // Nueva propiedad para el host del socket
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  aiImageUrl,
  userImageUrl,
  host,
  purposeId,
  chatAgentHash,
  rigoUserToken,
  socketHost,
}) => {
  const [messages, setMessages] = useState([
    { text: "Hi, welcome to Intercom 👋", sender: "ai" },
    {
      text: "You're speaking with Rigo AI Agent - I'm here to answer your questions. You can also talk to the team if you need to.",
      sender: "ai",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!conversationId) return

    const newSocket = io(socketHost, { autoConnect: false });
    setSocket(newSocket);

    newSocket.connect();

    const onStartData = {
      token: rigoUserToken || chatAgentHash,
      purpose: purposeId,
      conversationId: conversationId,
    };

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("start", onStartData);
    });

    newSocket.on("response", (message) => {
      console.log("received a response ", message);
      
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;
        updatedMessages[lastMessageIndex].text += message.chunk;
        return updatedMessages;
      });
    });

    newSocket.on("responseFinished", (data) => {
      if (data.status === "ok") {
        console.log("Response finished");
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    initConversation();
  }, [host, purposeId, chatAgentHash, rigoUserToken]);

  const initConversation = async () => {
    const headers = {
      "Content-Type": "application/json",
      "Chat-Agent-Hash": chatAgentHash,
      Authorization: `Token ${rigoUserToken || chatAgentHash}`,
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

  const handleSendMessage = () => {
    if (inputValue.trim() && socket) {
      const messageData = {
        message: { type: "user", text: inputValue },
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
    <div>
      <div className={styles.header}>
        <h2>Fin</h2>
      </div>
      <div className={styles.subHeader}>
        <img src={aiImageUrl} alt="AI Icon" className={styles.aiIcon} />
        <p>AI Agent answers instantly</p>
      </div>
      <div className={styles.messageContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              message.sender === "ai" ? styles.aiMessage : styles.userMessage
            }`}
          >
            <span>
              {message.sender === "ai" ? (
                <img
                  src={aiImageUrl}
                  alt="AI Icon"
                  className={styles.messageIcon}
                />
              ) : (
                <img
                  src={userImageUrl}
                  alt="User Icon"
                  className={styles.messageIcon}
                />
              )}
            </span>
            <div className={styles.replyText}>
              <p>{message.text}</p>
              <span>{message.sender === "ai" ? "Bot" : "You"} · Just now.</span>
            </div>
          </div>
        ))}
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Ask a question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyUp={handleKeyUp}
            className={styles.messageInput}
          />
          <button onClick={handleSendMessage} className={styles.sendButton}>
            {svgs.send}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ChatBubbleProps {
  logoUrl: string;
  aiImageUrl: string;
  userImageUrl: string;
  welcomeMessage: string;
  host: string;
  purposeId: number;
  chatAgentHash: string;
  rigoUserToken?: string;
  socketHost: string; // Nueva propiedad para el host del socket
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  logoUrl,
  aiImageUrl,
  userImageUrl,
  welcomeMessage,
  host,
  purposeId,
  chatAgentHash,
  rigoUserToken,
  socketHost,
}) => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("Home");

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "Home":
        return (
          <ChatHome
            setActiveSection={setActiveSection}
            welcomeMessage={welcomeMessage}
          />
        );
      case "Messages":
        return (
          <ChatMessages
            aiImageUrl={aiImageUrl}
            userImageUrl={userImageUrl}
            host={host}
            purposeId={purposeId}
            chatAgentHash={chatAgentHash}
            rigoUserToken={rigoUserToken}
            socketHost={socketHost} // Pasar la nueva propiedad
          />
        );
      case "FAQ":
        return <ChatFAQ />;
      default:
        return null;
    }
  };

  return (
    <div >
      <div className={styles.chatButton} onClick={toggleChat}>
        <img src={logoUrl} alt="Chat Icon" />
      </div>
      {isChatVisible && (
        <div className={styles.chatContainer}>
          {renderSection()}
          <div className={styles.footer}>
            <button
              onClick={() => setActiveSection("Home")}
              className={activeSection === "Home" ? styles.activeButton : ""}
            >
              {svgs.home}
              Home
            </button>
            <button
              onClick={() => setActiveSection("Messages")}
              className={
                activeSection === "Messages" ? styles.activeButton : ""
              }
            >
              {svgs.messages}
              Messages
            </button>
            <button
              onClick={() => setActiveSection("FAQ")}
              className={activeSection === "FAQ" ? styles.activeButton : ""}
            >
              {svgs.faq}
              FAQ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
