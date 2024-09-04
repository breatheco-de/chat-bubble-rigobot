import React, { useState } from "react";
import ReactDOMClient from "react-dom/client";
import "./index.css";
import { ChatBubble } from "./components/ChatBubble/ChatBubble.tsx";

interface User {
  context: string;
  token: string;
  avatar: string;
  nickname: string;
}

interface Options {
  hidden?: boolean;
  context?: string;
}

interface RigobotProps {
  chatAgentHash: string;
  options: Options;
  collapsed: boolean;
}

const Rigobot: React.FC<RigobotProps> = ({ chatAgentHash, options, collapsed }) => {
  const [isVisible, setIsVisible] = useState(!options.hidden);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [userContext, setUserContext] = useState(options.context || "");

  return (
    <>
      {isVisible && (
        <div className="rigobot-container">
          <div className="rigobot-chat">
            <ChatBubble
              aiImageUrl="vite.svg"
              user={{
                context: userContext,
                token: chatAgentHash,
                avatar: "",
                nickname: "User",
              }}
              socketHost="http://localhost:8000"
              welcomeMessage="Hello! I'm Rigo, your friendly AI assistant, how can I help you"
              host="https://rigobot.herokuapp.com"
              purposeId={1}
              chatAgentHash={chatAgentHash}
              collapsed={isCollapsed}
            />
          </div>
        </div>
      )}
    </>
  );
};

interface Rigo {
  init: (token: string, options?: Options) => void;
  show: (collapsed?: boolean) => void;
  hide: () => void;
  updateContext: ({ override, payload }: { override?: boolean; payload: string }) => void;
  container?: HTMLElement;
  options?: Options;
  token?: string;
  root?: ReactDOMClient.Root;
}

declare global {
  interface Window {
    rigo: Rigo;
  }
}

window.rigo = {
  init: function (token, options = {}) {
    const container = document.createElement("div");
    document.body.appendChild(container);

    this.container = container;
    this.options = options;
    this.token = token;

    this.root = ReactDOMClient.createRoot(container);
    this.root.render(
      <React.StrictMode>
        <Rigobot chatAgentHash={token} options={options} collapsed={true} />
      </React.StrictMode>
    );
  },
  show: function (collapsed = false) {
    if (this.container && this.root) {
      this.root.render(
        <React.StrictMode>
          <Rigobot
            chatAgentHash={this.token!}
            options={this.options!}
            collapsed={collapsed}
          />
        </React.StrictMode>
      );
    }
  },
  hide: function () {
    if (this.root) {
      this.root.unmount();
    }
  },
  updateContext: function ({ override = true, payload }) {
    if (this.root) {
      const newContext = override ? payload : `${this.options!.context} ${payload}`;
      this.options!.context = newContext;
      this.root.render(
        <React.StrictMode>
          <Rigobot
            chatAgentHash={this.token!}
            options={{ ...this.options!, context: newContext }}
            collapsed={true}
          />
        </React.StrictMode>
      );
    }
  },
};
