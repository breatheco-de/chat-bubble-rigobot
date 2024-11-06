/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { chatStyles, StyledMessage } from "../ChatBubble/ChatBubbleStyles";
import { svgs } from "../../assets/svgs";
import MarkdownRenderer from "../MarkdownRenderer/MarkdownRenderer";
import gif from "../../assets/bubble.gif";
export const RigoThumbnail = ({
  withOnline = false,
  onClick = () => {},
  moving = false,
}: {
  withOnline?: boolean;
  onClick?: () => void;
  moving?: boolean;
}) => {
  return (
    // @ts-ignore
    <div onClick={onClick} style={chatStyles.thumbnail}>
      {moving ? (
        <img style={{ maxWidth: "100%", height: "auto" }} src={gif} />
      ) : (
        svgs.rigoSvg
      )}

      {withOnline && (
        <div
          // @ts-ignore
          style={chatStyles.onlineCircle}
        ></div>
      )}
    </div>
  );
};

export const Message = ({ user, message }: { user: any; message: any }) => {
  return (
    <StyledMessage sender={message.sender}>
      {message.sender === "ai" && <RigoThumbnail />}
      {message.sender === "person" && user.avatar && (
        <div style={{ borderRadius: "50%" }}>
          <img
            style={{ width: "20px", height: "20px", borderRadius: "50%" }}
            src={user.avatar}
          />
        </div>
      )}
      {message.sender === "person" && !user.avatar && (
        <span>{svgs.person}</span>
      )}
      <MarkdownRenderer markdown={message.text} />
    </StyledMessage>
  );
};
