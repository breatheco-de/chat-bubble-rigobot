import React from "react";
import ReactDOMClient from "react-dom/client";
import "./index.css";
import { ChatBubble } from "./components/ChatBubble/ChatBubble.tsx";
import { TCompletion } from "./types.ts";

interface Options {
  target?: string;
  welcomeMessage?: string;
  context?: string;
  introVideoUrl?: string;
  completions?: TCompletion[];
  showBubble?: boolean;
  collapsed?: boolean;
}

type TInitOpts = {
  completions?: TCompletion[];
  context?: string;
  introVideoUrl?: string;
};

interface RigobotProps {
  chatAgentHash: string;
  options: Options;
}

const Rigobot: React.FC<RigobotProps> = ({ chatAgentHash, options }) => {
  const isCollapsed = !Boolean(options.collapsed);
  const userContext = options.context || "";
  let originElement = null;

  if (options.target) {
    originElement = document.querySelector(options.target);
  }

  return options.showBubble ? (
    <ChatBubble
      user={{
        context: userContext,
        token: chatAgentHash,
        avatar: "",
        nickname: "User",
      }}
      socketHost="https://ai.4geeks.com"
      welcomeMessage={options.welcomeMessage || "Hi! How can I help you! 👋"}
      host="https://rigobot.herokuapp.com"
      purposeId={1}
      chatAgentHash={chatAgentHash}
      collapsed={isCollapsed}
      originElement={originElement}
      introVideoUrl={options.introVideoUrl || ""}
      completions={options.completions}
    />
  ) : null;
};

interface Rigo {
  init: (token: string, options?: TInitOpts) => void;
  show: (params: {
    showBubble: boolean;
    target?: string;
    bubblePosition: {
      top?: string;
      left?: string;
      right?: string;
      bottom?: string;
    };
    collapsed?: boolean;
    welcomeMessage?: string;
  }) => void;
  hide: () => void;
  updateContext: ({
    override,
    payload,
  }: {
    override?: boolean;
    payload: string;
  }) => void;
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
  },
  show: function (showOpts) {
    if (this.container) {
      const options = {
        ...this.options,
        ...showOpts,
        collapsed: typeof showOpts.collapsed === "boolean" ? showOpts.collapsed : true
      };

      this.root = ReactDOMClient.createRoot(this.container);
      this.root.render(
        <React.StrictMode>
          <Rigobot chatAgentHash={this.token!} options={options} />
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
      const newContext = override
        ? payload
        : `${this.options!.context} ${payload}`;
      this.options!.context = newContext;
      this.root.render(
        <React.StrictMode>
          <Rigobot
            chatAgentHash={this.token!}
            options={{ ...this.options!, context: newContext }}
          />
        </React.StrictMode>
      );
    }
  },
};
