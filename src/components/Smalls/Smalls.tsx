/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import { chatStyles, StyledMessage } from "../ChatBubble/ChatBubbleStyles";
import { svgs } from "../../assets/svgs";
import MarkdownRenderer from "../MarkdownRenderer/MarkdownRenderer";

export const RigoThumbnail = ({ withOnline = false }) => {
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

export const Message = ({ message }: { message: any }) => {
  return (
    <StyledMessage sender={message.sender}>
      {message.sender === "ai" ? <RigoThumbnail /> : <span>{svgs.person}</span>}
      <MarkdownRenderer markdown={message.text} />
    </StyledMessage>
  );
};
