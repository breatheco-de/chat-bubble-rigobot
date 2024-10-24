import styled, { keyframes } from "styled-components";

export const rootVariables = {
  activeColor: "#0084FF",
  successColor: "#25BF6C",
  softBlue: "#EEF9FE",
  lightGrey: "#DADADA",
  backgroundGreyLight: "#F0F0F0",
  backdropBG: "#00000060",
};

export const chatStyles = {
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
    minWidth: "400px",
    borderRadius: "10px",
    boxSizing: "border-box",
    height: "auto",
    fontFamily: "'Lato', sans-serif",
    border: `3px solid ${rootVariables.softBlue}`,
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
    cursor: "pointer",
    background: rootVariables.activeColor,
  },
  messagesContainer: {
    padding: "16px",
    paddingBottom: "300px",
    overflowY: "scroll",
    maxHeight: "500px",
    boxSizing: "border-box",
    fontFamily: "'Lato', sans-serif",
    scrollbarWidth: "none",
  },
};

export const getContainerPosition = (
  rootElement: Element | null,
  showBubble: boolean | undefined,
  containerWidth: number,
  containerHeight: number
): object => {
  if (!rootElement) {
    return {
      position: "fixed",
      bottom: 80,
      right: 20,
    };
  } else {
    const rect = rootElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top: number | "auto" = rect.bottom + (showBubble ? 50 : 0);
    let left: number | "auto" = rect.left;
    let bottom: number | "auto" = "auto";
    let right: number | "auto" = "auto";

    if (top + containerHeight > viewportHeight) {
      top = "auto";
      bottom = viewportHeight - rect.top + (showBubble ? 50 : 0);
    }

    // Adjust left and right if the container overflows the viewport
    if (left + containerWidth > viewportWidth) {
      left = "auto";
      right = viewportWidth - rect.right;
    }

    return {
      position: "absolute",
      top: top !== "auto" ? top : undefined,
      left: left !== "auto" ? left : undefined,
      bottom: bottom !== "auto" ? bottom : undefined,
      right: right !== "auto" ? right : undefined,
      // transition: 'top 1s ease, left 1s ease',
    };
  }
};

export const getBubbleStyles = (
  rootElement: HTMLElement | null,
  prevStyles: any
) => {
  const bubbleWidth = 50;
  const bubbleHeight = 50;

  if (!rootElement) {
    return chatStyles.bubble;
  } else {
    const rect = rootElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementBottom = rect.bottom;
    let elementRight: number = rect.right;

    let top: string | "auto" = "100%";
    let left: string | "auto" = "100%";
    let bottom: string | "auto" = "auto";
    let right: string | "auto" = "auto";

    if (prevStyles && "top" in prevStyles && prevStyles.top === "auto") {
      top = "auto";
      bottom = prevStyles.bottom;
    }

    if (prevStyles && "left" in prevStyles && prevStyles.left === "auto") {
      left = "auto";
      right = prevStyles.right;
    }

    if (top !== "auto" && elementBottom + bubbleHeight > viewportHeight) {
      top = "auto";
      bottom = "100%";
    }

    // Adjust left and right if the bubble overflows the viewport
    if (left !== "auto" && elementRight + bubbleWidth > viewportWidth) {
      left = "auto";
      right = "100%";
    }

    return {
      ...chatStyles.bubble,
      position: "absolute",
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      transition: "top 1s ease, all 1s ease",
    };
  }
};

interface VideoContainerProps {
  inner: "true" | "false";
}

export const VideoContainer = styled.div<VideoContainerProps>`
  width: 100%;
  height: 200px;
  border-radius: ${(props) => (props.inner ? "0px" : "10px")};
  display: block;
  overflow: hidden;
  position: relative;
`;

interface StyledMessageProps {
  sender: "ai" | "person";
}

export const StyledMessage = styled.div<StyledMessageProps>`
  background: transparent;
  color: black;
  display: flex;
  width: 100%;
  gap: 4px;
  margin-bottom: 10px;
  align-items: center;
  white-space: normal;
  text-align: left;
  flex-direction: ${(props) => (props.sender === "ai" ? "row" : "row-reverse")};


  & p {
    word-break: break-word;
    margin: 0;
  }

  > div {
    padding: 10px;
    border-radius: 5px;
    ${(props) =>
      props.sender === "ai"
        ? `
           color: ${rootVariables.activeColor};
           background: ${rootVariables.softBlue}
           
           `
        : `
           
            color: black;
            background:#F5F5F5
           
            `}
  }
`;

const radarWave = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.4;
  }
  100% {
    transform: scale(2);
    opacity: 0;
    
  }
`;

const fadeOut = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    display: none
  }
`;

interface RadarElementProps {
  width: string;
  height: string;
  top: string;
  left: string | undefined;
  right: string | undefined;
}

export const RadarElement = styled.div<RadarElementProps>`
animation: ${radarWave} 1s infinite, ${fadeOut} 6s forwards;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: transparent;
  border: 4px solid red;
  border-radius: 5px;
  position: absolute;
  top: ${(props) => `calc(${props.top})`};
  left: ${(props) => (props.left ? `calc(${props.left})` : "0px")};
  right: ${(props) => (props.right ? `calc(${props.right})` : "0px")};
`;

const palpitating = keyframes`
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(2);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

interface PalpitatingBubbleProps {
  width: string;
  height: string;
}

export const PalpitatingBubble = styled.div<PalpitatingBubbleProps>`
  animation: ${palpitating} 1s infinite, ${fadeOut} 6s forwards;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: ${rootVariables.activeColor};
  border-radius: 50%;
  position: absolute;
`;

export const ChatContainerStyled = styled.div`
  background-color: white;
  border-radius: 10px;
  position: absolute;
  width: min(400px, 85vw);
  bottom: 60px;
  z-index: 1000;
`;
