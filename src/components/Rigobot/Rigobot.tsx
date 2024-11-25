import { ChatBubble } from "../ChatBubble/ChatBubble";

import { RigobotProps } from "../../types";
import React, { useEffect, useState } from "react";
import { logger } from "../../utils/utilities";

export const Rigobot: React.FC<RigobotProps> = ({ chatAgentHash, options }) => {
  const [currentOptions, setCurrentOptions] = useState(options);

  const [originElement, setOriginElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleOptionsUpdate = (event: any) => {
      setCurrentOptions(event.detail);
    };

    window.addEventListener("optionsUpdated", handleOptionsUpdate);

    return () => {
      window.removeEventListener("optionsUpdated", handleOptionsUpdate);
    };
  }, []);

  useEffect(() => {
    // Update isCollapsed and originElement whenever currentOptions change
    if (currentOptions.target) {
      const element = document.querySelector(currentOptions.target);
      // @ts-ignore
      setOriginElement(element);
      logger.debug("MOVING TO TARGET ELEMENT", element);
    } else {
      setOriginElement(null);
    }
  }, [currentOptions]);

  logger.debug("Starting Rigobot with the following options");
  logger.debug(currentOptions);

  const completeContext = `
  ALL THIS CONTEXT IS IMPORTART FOR YOUR TASK
  ---page context---
  ${currentOptions.context}
  ---

  ---user context---
  ${currentOptions.user?.context || ""}
  ---
  `;

  const toggleCollapsed = () => {
    console.log("Toggling collapsed");
    
    setCurrentOptions({
      ...currentOptions,
      collapsed: !currentOptions.collapsed,
    });
  };

  logger.debug(
    "Collapsed initializing Rigobot bubble",
    currentOptions.collapsed
  );
  console.log("Collapsed state", currentOptions.collapsed);
  
  return (
    <ChatBubble
      user={{
        context: completeContext,
        token: currentOptions.user?.token || "",
        avatar: currentOptions.user?.avatar || "",
        nickname: currentOptions.user?.nickname || "User",
      }}
      socketHost={currentOptions.socketHost || "https://ai.4geeks.com"}
      welcomeMessage={
        currentOptions.welcomeMessage || "Hi! How can I help you! 👋"
      }
      host="https://rigobot.herokuapp.com"
      purposeId={
        currentOptions.purposeId ? currentOptions.purposeId : undefined
      }
      purposeSlug={
        currentOptions.purposeSlug
          ? currentOptions.purposeSlug
          : "4geeks-academy-salesman"
      }
      chatAgentHash={chatAgentHash}
      collapsed={
        typeof currentOptions?.collapsed === "boolean"
          ? currentOptions?.collapsed
          : false
      }
      originElement={originElement}
      introVideo={currentOptions.introVideo}
      completions={currentOptions.completions}
      showBubble={currentOptions.showBubble}
      highlight={currentOptions.highlight}
      toggleCollapsed={toggleCollapsed}
    />
  );
};
