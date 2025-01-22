import "@fontsource/lato";

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
  placeholder: string;
};

const ChatInput = ({
  inputValue,
  onInputChange,
  onKeyUp,
  onSubmit,
  placeholder,
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
        placeholder={placeholder}
        value={inputValue}
        // onChange={(e) => setInputValue(e.target.value)}
        onChange={onInputChange}
        onKeyUp={onKeyUp}
        style={{
          padding: "10px",
          width: "100%",
          borderRadius: "11px",
          border: `1px solid ${rootVariables.lightGrey}`,
          color: "#000000",
          background: "white",
          outline: `1px solid ${rootVariables.lightGrey}`,
        }}
      />
      <span style={{ cursor: "pointer" }} onClick={onSubmit}>
        {svgs.send}
      </span>
    </div>
  );
};

// const example_CODE = `
//   \`\`\`python
//   def greet(name):
//     print("Hello, " + name) asd asd asd asd asd asd asd asd
//   \`\`\`
// `;

// const exampleOrderedList = `
// 1. **First item**: With information abut the first item
// 2. **Second item**: With information abut the second item
// 3. **Third item**: With information abut the third item

// `;

// const DEFAULT_EXAMPLE_MESSAGe = [
//   { text: example_CODE, sender: "ai" },
//   { text: exampleOrderedList, sender: "ai" },
//   { text: "I'm good, thanks", sender: "person" },
// ];

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
    // ...DEFAULT_EXAMPLE_MESSAGe,
    ...storedMessages,
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef(0);
  const [autoScroll, setAutoScroll] = useState(true);

  const [isTryingToMove, setIsTryingToMove] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
      setIsLoading(false);
      setIsTryingToMove(false);
      if (data.status === "ok") {
        const response = data.ai_response;
        const result = extractMovetoContent(response);
        if (result.targetElement) {
          logger.debug(
            `Moving chat to target element ${result.targetElement} as Rigobot requested `
          );
          setOriginElementBySelector(result.targetElement);
        }

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages];
          const lastMessageIndex = updatedMessages.length - 1;
          updatedMessages[lastMessageIndex].text = result.textWithoutTags;

          if (window.rigo.callbacks["incoming_message"]) {
            try {
              window.rigo.callbacks["incoming_message"]({
                text: data.ai_response,
                conversation: {
                  id: conversationId,
                  purpose: purposeSlug,
                },
                messages: prevMessages,
                when: new Date().toISOString(),
                url: window.location.href,
              });
            } catch (error) {
              logger.error("Error calling incoming_message callback", error);
            }
          }
          return updatedMessages;
        });
      }
    });
    return () => {
      socket.off("response");
      socket.off("responseFinished");
    };
  }, [isTryingToMove, socket, conversationId]);

  useEffect(() => {
    if (!messagesContainerRef.current || !autoScroll) return;
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
    // scrollPosition.current = messagesRef.current.scrollTop || 0;
  }, [messages, autoScroll]);

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
      const completeContext = createContext(
        user.context,
        JSON.stringify(completions),
        messages.map((m) => `${m.sender}: ${m.text}`).join("\n")
      );

      const messageData = {
        message: {
          type: "user",
          text: inputValue,
          context: completeContext,
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
      setIsLoading(true);
      setAutoScroll(true);

      if (window.rigo.callbacks["outgoing_message"]) {
        window.rigo.callbacks["outgoing_message"]({
          text: inputValue,
          conversation: {
            id: conversationId,
            purpose: purposeSlug,
          },
          messages: messages,
          context: completeContext,
          when: new Date().toISOString(),
          url: window.location.href,
        });
      }
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

  const handleScroll = () => {
    if (
      messagesContainerRef.current?.scrollTop &&
      messagesContainerRef.current?.scrollTop < scrollPosition.current
    ) {
      setAutoScroll(false);
    } else if (
      messagesContainerRef.current?.scrollTop &&
      messagesContainerRef.current?.scrollTop > scrollPosition.current
    ) {
      scrollPosition.current = messagesContainerRef.current?.scrollTop || 0;
      if (!autoScroll) {
        setAutoScroll(true);
      }
    }
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
          <p>Rigobot AI</p>
        </section>
        <section>
          <span style={{ cursor: "pointer" }} onClick={closeChat}>
            {svgs.cancel}
          </span>
        </section>
      </div>
      {introVideo && <VideoDisplay inner={true} video={introVideo} />}
      <div
        onScroll={handleScroll}
        ref={messagesContainerRef}
        // @ts-ignore
        style={chatStyles.messagesContainer}
      >
        {messages.map((message, index) => (
          <Message user={user} message={message} key={index} />
        ))}
      </div>
      <ChatInput
        placeholder={isLoading ? "Thinking..." : "Ask Rigobot..."}
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
  toggleCollapsed,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [originElementState, setOriginElementState] =
    useState<HTMLElement | null>(originElement as HTMLElement);
  const [bubbleStyles, setBubbleStyles] = useState(
    getBubbleStyles(originElementState, null)
  );
  const bubbleStylesRef = useRef(bubbleStyles);

  useEffect(() => {
    if (!collapsed && containerRef.current) {
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
  }, [collapsed]);

  // useEffect(() => {
  //   bubbleStylesRef.current = bubbleStyles;
  //   // toggleCollapsed({ enforce: true });
  //   setTimeout(() => {
  //     // toggleCollapsed({ enforce: false });
  //   }, 100);
  // }, [bubbleStyles]);

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
                // moving={true}
                onClick={toggleCollapsed}
              />
              <div style={{ position: "relative" }}>
                <RadarElement
                  key={`${originElementState?.id}-${originElementState?.className}`}
                  {...getRadarElementProps()}
                />
              </div>
              {Boolean(highlight) && (
                <PalpitatingBubble
                  onClick={toggleCollapsed}
                  width="50px"
                  height="50px"
                />
              )}
            </>
          )}
          {!collapsed && (
            <ChatContainerStyled ref={chatContainerRef}>
              <ChatMessages
                user={user}
                host={host}
                purposeId={purposeId}
                purposeSlug={purposeSlug}
                chatAgentHash={chatAgentHash}
                socketHost={socketHost}
                closeChat={toggleCollapsed}
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
