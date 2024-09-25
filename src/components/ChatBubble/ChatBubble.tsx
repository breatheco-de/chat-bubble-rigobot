/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import "@fontsource/lato";
import "highlight.js/styles/github.css";

import React, { useState, useEffect, useRef } from "react";

import { svgs } from "../../assets/svgs";
import { io, Socket } from "socket.io-client";
import { ChatBubbleProps, ChatMessagesProps } from "../../types";
import {
  createContext,
  extractMovetoContent,
  initConversation,
  logger,
} from "../../utils/utilities";
import {
  chatStyles,
  getBubbleStyles,
  getContainerPosition,
  RadarElement,
  rootVariables,
} from "./ChatBubbleStyles";

import { VideoDisplay } from "../VideoContainer/VideoContainer";
import { Message, RigoThumbnail } from "../Smalls/Smalls";

type TChatInputProps = {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
};

const ChatInput = ({
  inputValue,
  onInputChange,
  onKeyUp,
  onSubmit,
}: TChatInputProps) => {
  return (
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
        // onChange={(e) => setInputValue(e.target.value)}
        onChange={onInputChange}
        onKeyUp={onKeyUp}
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "11px",
          border: `1px solid ${rootVariables.lightGrey}`,
          color: "black",
          outline: `1px solid ${rootVariables.lightGrey}`,
        }}
      />
      <span onClick={onSubmit}>{svgs.send}</span>
    </div>
  );
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
  introVideo,
  purposeSlug,
  setOriginElementBySelector,
}) => {
  const [messages, setMessages] = useState([
    { text: welcomeMessage, sender: "ai" },
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
      purpose: purposeId || purposeSlug,
      conversationId: conversationId,
    };

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("start", onStartData);
    });

    newSocket.on("response", (message) => {
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

          if (result.targetElement) {
            logger.debug(
              `Moving chat to target element ${result.targetElement} as Rigobot requested `
            );
            setOriginElementBySelector(result.targetElement);
          }

          return updatedMessages;
        });
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [conversationId]);

  useEffect(() => {
    initialize();
  }, [host, purposeId, chatAgentHash, user.token]);

  const initialize = async () => {
    const json = await initConversation({
      chatAgentHash: chatAgentHash,
      purposeId: purposeId,
      purposeSlug: purposeSlug,
      userToken: user.token || "",
      host: host,
    });
    setMessages([{ sender: "ai", text: json.salute }]);

    setConversationId(json.conversation_id);
  };

  const setRandomPosition = () => {
    const options = [
      "#chat-grow",
      ".centered-element",
      ".bottom-left-element",
      "#bottom-element",
    ];
    const randomSelector = options[Math.floor(Math.random() * options.length)];
    setOriginElementBySelector(randomSelector);
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && socket) {
      const messageData = {
        message: {
          type: "user",
          text: inputValue,
          context: createContext(user.context, JSON.stringify(completions)),
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

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
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
        <section
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "white",
            fontWeight: 500,
          }}
        >
          <RigoThumbnail withOnline={true} />
          <p>Rigobot AI </p>
        </section>
        <section>
          <span style={{ cursor: "pointer" }} onClick={closeChat}>
            {svgs.cancel}
          </span>
          <span style={{ cursor: "pointer" }} onClick={setRandomPosition}>
            {svgs.rigoSvg}
          </span>
        </section>
      </div>
      {introVideo && <VideoDisplay inner={true} video={introVideo} />}
      {/* @ts-ignore */}
      <div className="chat-messages" style={chatStyles.messagesContainer}>
        {messages.map((message, index) => (
          <Message message={message} key={index} />
        ))}
      </div>
      <ChatInput
        inputValue={inputValue}
        onKeyUp={handleKeyUp}
        onSubmit={handleSendMessage}
        onInputChange={onInputChange}
      />
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
  introVideo,
  completions,
  showBubble,
  purposeSlug,
}) => {
  const [isChatVisible, setIsChatVisible] = useState<boolean>(collapsed);
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [originElementState, setOriginElementState] =
    useState<HTMLElement | null>(originElement as HTMLElement);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  useEffect(() => {
    setIsChatVisible(collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (isChatVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust horizontal position
      if (rect.right > viewportWidth) {
        containerRef.current.style.left = `${viewportWidth - rect.width}px`;
      } else if (rect.left < 0) {
        containerRef.current.style.left = "0px";
      }

      // Adjust vertical position
      if (rect.bottom > viewportHeight) {
        containerRef.current.style.top = `${viewportHeight - rect.height}px`;
      } else if (rect.top < 0) {
        containerRef.current.style.top = "0px";
      }
    }
  }, [isChatVisible]);

  useEffect(() => {
    console.log(
      "The origin element has changed! Trying to move chat bubble and activating pulsar"
    );
    setIsChatVisible(false);
  }, [originElementState]);

  const setOriginElementBySelector = (selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      setOriginElementState(element);
    } else {
      console.warn(`Element with selector "${selector}" not found.`);
    }
  };

  const getRadarElementProps = () => {
    logger.debug("Changing props for Radar");

    if (originElementState) {
      logger.debug("Target element found! Calculating radar dimensions");
      const rect = originElementState.getBoundingClientRect();
      return {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        top: `${rect.top}px`,
        left: `${rect.left}px`,
      };
    }
    return {
      width: "0px",
      height: "0px",
      top: "0px",
      left: "0px",
    };
  };

  return (
    <>
      {showBubble && (
        // @ts-ignore
        <div style={getBubbleStyles(originElementState)} onClick={toggleChat}>
          <RigoThumbnail />
          <RadarElement key={`${originElementState?.id}-${originElementState?.className}`} {...getRadarElementProps()} />
        </div>
      )}

      {isChatVisible && (
        <div
          id="chat-video-container"
          ref={containerRef} // Attach the reference to the container
          style={{
            ...getContainerPosition(originElementState, showBubble, 400, 600),
            display: "flex",
            background: rootVariables.backgroundGreyLight,
            padding: "8px",
            gap: "16px",
            borderRadius: "10px",
          }}
        >
          {introVideo && <VideoDisplay inner={false} video={introVideo} />}

          {/* @ts-ignore */}
          <div style={chatStyles.chatContainer}>
            <ChatMessages
              user={user}
              host={host}
              purposeId={purposeId}
              purposeSlug={purposeSlug}
              chatAgentHash={chatAgentHash}
              socketHost={socketHost}
              closeChat={toggleChat}
              welcomeMessage={welcomeMessage}
              completions={completions}
              backdropRef={backdropRef}
              introVideo={introVideo}
              setOriginElementBySelector={setOriginElementBySelector}
            />
          </div>
        </div>
      )}
    </>
  );
};
