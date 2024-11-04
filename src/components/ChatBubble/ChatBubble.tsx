import "@fontsource/lato";
import "highlight.js/styles/github.css";

import React, { useState, useEffect, useRef } from "react";

import { svgs } from "../../assets/svgs";
import { ChatBubbleProps, ChatMessagesProps } from "../../types";
import {
  createContext,
  extractMovetoContent,
  initConversation,
  logger,
} from "../../utils/utilities";
import {
  ChatContainerStyled,
  chatStyles,
  getBubbleStyles,
  // getContainerPosition,
  PalpitatingBubble,
  RadarElement,
  rootVariables,
} from "./ChatBubbleStyles";

import { VideoDisplay } from "../VideoContainer/VideoContainer";
import { Message, RigoThumbnail } from "../Smalls/Smalls";
import { useStore } from "../../utils/store";
import { createPortal } from "react-dom";

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
          background: "white",
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
  const {
    storedMessages,
    setStoredMessages,
    socket,
    connectSocket,
    setConversationId,
    conversationId,
  } = useStore((state) => ({
    storedMessages: state.messages,
    setStoredMessages: state.setMessages,
    socket: state.socket,
    connectSocket: state.connectSocket,
    setConversationId: state.setConversationId,
    conversationId: state.conversationId,
  }));

  const [messages, setMessages] = useState([
    { text: welcomeMessage, sender: "ai" },
    ...storedMessages,
  ]);
  const [inputValue, setInputValue] = useState("");

  const [isTryingToMove, setIsTryingToMove] = useState<boolean>(false);

  useEffect(() => {
    if (!conversationId) return;

    if (!socket) {
      connectSocket({ socketHost });
      return;
    }

    const onStartData = {
      token: chatAgentHash || user.token,
      purpose: purposeId || purposeSlug,
      conversationId: conversationId,
    };

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("start", onStartData);
    });
  }, [conversationId, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on("response", (message) => {
      setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessageIndex = updatedMessages.length - 1;

        let updatedText =
          updatedMessages[lastMessageIndex].text + message.chunk;

        if (updatedText.includes("<moveto>")) {
          setIsTryingToMove(true);
          updatedText = updatedText.split("<moveto>")[0];
          updatedMessages[lastMessageIndex].text = updatedText;
        }

        if (!isTryingToMove) {
          updatedMessages[lastMessageIndex].text += message.chunk;
        }

        return updatedMessages;
      });
    });

    socket.on("responseFinished", (data) => {
      console.log(isTryingToMove, " IS TRYING TO MOVE");

      setIsTryingToMove(false);
      if (data.status === "ok") {
        console.log(data);

        const response = data.ai_response;
        const result = extractMovetoContent(response);
        if (result.targetElement) {
          logger.debug(
            `Moving chat to target element ${result.targetElement} as Rigobot requested `
          );
          setOriginElementBySelector(result.targetElement);
        }
      }
    });
    return () => {
      socket.off("response");
      socket.off("responseFinished");
    };
  }, [isTryingToMove, socket, conversationId]);

  useEffect(() => {
    initialize();
  }, [host, purposeId, chatAgentHash, user.token]);

  const initialize = async () => {
    if (storedMessages.length > 0) {
      setMessages(storedMessages);
    }
    if (!conversationId) {
      const json = await initConversation({
        chatAgentHash: chatAgentHash,
        purposeId: purposeId,
        purposeSlug: purposeSlug,
        userToken: "",
        host: host,
      });
      logger.debug("Initializing chat", json);
      setConversationId(json.conversation_id);
    }
  };

  const handleSendMessage = () => {
    if (inputValue.trim() && socket) {
      const messageData = {
        message: {
          type: "user",
          text: inputValue,
          context: createContext(
            user.context,
            JSON.stringify(completions),
            messages.map((m) => `${m.sender}: ${m.text}`).join("\n")
          ),
        },
        conversation: {
          id: conversationId,
          purpose: purposeId,
          token: chatAgentHash,
        },
      };

      socket.emit("message", messageData);

      const newMessages = [
        ...messages,
        { text: inputValue, sender: "person" },
        { text: "", sender: "ai" },
      ];
      setMessages(newMessages);
      // @ts-ignore
      setStoredMessages(newMessages);

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
        height: "600px",
        width: "100%",
        overflowY: "hidden",
        border: "1px solid #ccc",
        boxSizing: "border-box",
        borderRadius: "10px",
        backgroundColor: "white",
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
            scrollbarWidth: "none",
          }}
        >
          <RigoThumbnail withOnline={true} />
          <p>Rigobot AI </p>
        </section>
        <section>
          <span style={{ cursor: "pointer" }} onClick={closeChat}>
            {svgs.cancel}
          </span>
        </section>
      </div>
      {introVideo && <VideoDisplay inner={true} video={introVideo} />}
      {/* @ts-ignore */}
      <div style={chatStyles.messagesContainer}>
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
  highlight,
}) => {
  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [originElementState, setOriginElementState] =
    useState<HTMLElement | null>(originElement as HTMLElement);
  const [bubbleStyles, setBubbleStyles] = useState(
    getBubbleStyles(originElementState, null)
  );
  const bubbleStylesRef = useRef(bubbleStyles);

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  useEffect(() => {
    setIsChatVisible(!collapsed);
  }, [collapsed]);

  useEffect(() => {
    if (isChatVisible && containerRef.current) {
      if (!chatContainerRef.current) return;

      const rect = chatContainerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;

      const bodyScrollHeight = document.body.scrollHeight;
      // Adjust horizontal position
      if (rect.right > viewportWidth) {
        chatContainerRef.current.style.right = `5px`;
        logger.debug("Right side of chat bubble is out of viewport");
      } else if (rect.left < 0) {
        chatContainerRef.current.style.left = "0px";
      }

      // Adjust vertical position
      if (rect.bottom > bodyScrollHeight) {
        chatContainerRef.current.style.top = `${
          bodyScrollHeight - rect.height
        }px`;
      } else if (rect.top < 0) {
        chatContainerRef.current.style.top = "80px";
      }
    }
  }, [isChatVisible]);

  useEffect(() => {
    bubbleStylesRef.current = bubbleStyles;
    setIsChatVisible(false);
    setTimeout(() => {
      setIsChatVisible(!collapsed);
    }, 100);
  }, [bubbleStyles]);

  useEffect(() => {
    setBubbleStyles(
      getBubbleStyles(originElementState, bubbleStylesRef.current)
    );
  }, [originElementState]);

  useEffect(() => {
    setOriginElementState(originElement as HTMLElement);
  }, [originElement]);

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

      const top =
        bubbleStyles.bottom === "auto"
          ? `-${rect.height * 2}px`
          : `${rect.height}px`;

      return {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        top: top,
        left: `-${rect.width + 50}px`,
        right: undefined,
      };
    }
    return {
      width: "0px",
      height: "0px",
      top: "0px",
      left: "0px",
      right: "auto",
    };
  };

  return (
    <>
      {createPortal(
        // @ts-ignore
        <div style={bubbleStyles} ref={containerRef}>
          {showBubble && (
            <>
              <RigoThumbnail
                moving={originElementState ? true : false}
                onClick={toggleChat}
              />
              <div style={{ position: "relative" }}>
                <RadarElement
                  key={`${originElementState?.id}-${originElementState?.className}`}
                  {...getRadarElementProps()}
                />
              </div>
              {Boolean(highlight) && (
                <PalpitatingBubble
                  onClick={toggleChat}
                  width="50px"
                  height="50px"
                />
              )}
            </>
          )}
          {isChatVisible && (
            <ChatContainerStyled ref={chatContainerRef}>
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
            </ChatContainerStyled>
          )}
        </div>,

        originElementState || document.body
      )}
    </>
  );
};
