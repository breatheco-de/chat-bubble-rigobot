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
    width: "400px",
    borderRadius: "10px",
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
    background: "white",
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

    let top: number | "auto" = rect.bottom + (showBubble ? 70 : 0);
    let left: number | "auto" = rect.left;
    let bottom: number | "auto" = "auto";
    let right: number | "auto" = "auto";

    if (top + containerHeight > viewportHeight) {
      top = "auto";
      bottom = viewportHeight - rect.top + (showBubble ? 70 : 0);
    }

    // Adjust left and right if the container overflows the viewport
    if (left + containerWidth > viewportWidth) {
      left = "auto";
      right = viewportWidth - rect.right;
    }

    return {
      position: "fixed",
      top: top !== "auto" ? top : undefined,
      left: left !== "auto" ? left : undefined,
      bottom: bottom !== "auto" ? bottom : undefined,
      right: right !== "auto" ? right : undefined,
      // transition: 'top 1s ease, left 1s ease',
    };
  }
};

export const getBubbleStyles = (rootElement: Element) => {
  const bubbleWidth = 50;
  const bubbleHeight = 50;

  if (!rootElement) {
    return chatStyles.bubble;
  } else {
    const rect = rootElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let top: number | "auto" = rect.bottom;
    let left: number | "auto" = rect.left;
    let bottom: number | "auto" = "auto";
    let right: number | "auto" = "auto";

    // Adjust top and bottom if the bubble overflows the viewport
    if (top + bubbleHeight > viewportHeight) {
      top = "auto";
      bottom = viewportHeight - rect.top;
    }

    // Adjust left and right if the bubble overflows the viewport
    if (left + bubbleWidth > viewportWidth) {
      left = "auto";
      right = viewportWidth - rect.right;
    }

    return {
      ...chatStyles.bubble,
      top: top !== "auto" ? top : undefined,
      left: left !== "auto" ? left : undefined,
      bottom: bottom !== "auto" ? bottom : undefined,
      right: right !== "auto" ? right : undefined,
      transition: "top 1s ease, left 1s ease",
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
 
  
`;

interface StyledMessageProps {
  sender: "ai" | "person";
}

export const StyledMessage = styled.div<StyledMessageProps>`
  background: transparent;
  color: black;
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  align-items: center;

  flex-direction: ${(props) => (props.sender === "ai" ? "row" : "row-reverse")};

  & p {
    margin: 0 0 15px 0;
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
  }
`;

interface RadarElementProps {
  width: string;
  height: string;
  top: string;
  left: string;
}

export const RadarElement = styled.div<RadarElementProps>`
  animation: ${radarWave} 1s infinite, ${fadeOut} 6s forwards;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  background-color: transparent;
  border: 4px solid red;
  border-radius: 5px;
  position: fixed;
  top: ${(props) => `calc(${props.top})`};
  left: ${(props) => `calc(${props.left})`};
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
  position: absolute
`;
