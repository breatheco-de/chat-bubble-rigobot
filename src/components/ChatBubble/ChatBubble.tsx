import React, { useState, useEffect } from "react";
import styles from "./ChatBubble.module.css";
import { svgs } from "../../assets/svgs";
import { io, Socket } from "socket.io-client";
import MarkdownIt from "markdown-it";

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
  user: {
    context: string;
    token: string;
    avatar: string;
    nickname: string;
  };
  host: string;
  purposeId: number;
  chatAgentHash: string;
  socketHost: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({
  aiImageUrl,
  user,
  host,
  purposeId,
  chatAgentHash,
  socketHost,
}) => {
  const [messages, setMessages] = useState([
    { text: "Hi, welcome to 4Geeks 👋", sender: "ai" },
    {
      text: "I'm Rigo AI and I'm here to answer your questions. Is there anything I can help with?",
      sender: "ai",
    },
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

  const handleSendMessage = () => {
    if (inputValue.trim() && socket) {
      const messageData = {
        message: {
          type: "user",
          text: inputValue,
          context: user.context || "",
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

  const md = new MarkdownIt();
  const htmlFromMarkdown = (markdown: string) => {
    return { __html: md.render(markdown) };
  };

  return (
    <div>
      <div className={styles.header}>
        <h2>Rigobot AI</h2>
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
                <div>{svgs.rigoSvg}</div>
              ) : (
                <div>{svgs.person}</div>
              )}
            </span>
            <div
              className={styles.replyText}
              dangerouslySetInnerHTML={htmlFromMarkdown(message.text)}
            ></div>
            {/* <span>
              {message.sender === "ai" ? "Bot" : user.nickname} · Just now.
            </span> */}
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
  logoUrl?: string;
  aiImageUrl: string;
  user: {
    context: string;
    token: string;
    avatar: string;
    nickname: string;
  };
  welcomeMessage: string;
  host: string;
  purposeId: number;
  chatAgentHash: string;
  socketHost: string;
  collapsed: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  logoUrl,
  aiImageUrl,
  user,
  welcomeMessage,
  host,
  purposeId,
  chatAgentHash,
  socketHost,
  collapsed,
}) => {
  const [isChatVisible, setIsChatVisible] = useState(collapsed);
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
            user={user}
            host={host}
            purposeId={purposeId}
            chatAgentHash={chatAgentHash}
            socketHost={socketHost}
          />
        );
      case "FAQ":
        return <ChatFAQ />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className={styles.chatButton} onClick={toggleChat}>
        {logoUrl ? <img src={logoUrl} alt="Chat Icon" /> : svgs.rigoSvg}
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
