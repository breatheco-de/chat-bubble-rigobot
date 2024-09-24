import React from "react";
import ReactDOMClient from "react-dom/client";
import { ChatBubble } from "./components/ChatBubble/ChatBubble.tsx";
import { Options, RigobotProps } from "./types.ts";
import { logger } from "./utils/utilities.ts";

const Rigobot: React.FC<RigobotProps> = ({ chatAgentHash, options }) => {
  const isCollapsed = !options.collapsed;
  const userContext = options.context || "";
  let originElement = null;

  if (options.target) {
    originElement = document.querySelector(options.target);
  }

  logger.debug("Starting Rigobot with the following options");
  logger.debug(`${JSON.stringify(options)}`);

  return (
    <ChatBubble
      user={{
        context: userContext,
        token: chatAgentHash,
        avatar: "",
        nickname: "User",
      }}
      // socketHost="http://127.0.0.1:8000"
      socketHost="https://ai.4geeks.com"
      welcomeMessage={options.welcomeMessage || "Hi! How can I help you! 👋"}
      // host="https://8000-charlytoc-rigobot-bmwdeam7cev.ws-us116.gitpod.io"
      host="https://rigobot.herokuapp.com"
      purposeId={options.purposeId ? options.purposeId : undefined}
      purposeSlug={
        options.purposeSlug ? options.purposeSlug : "4geeks-academy-salesman"
      }
      chatAgentHash={chatAgentHash}
      collapsed={isCollapsed}
      originElement={originElement}
      introVideo={options.introVideo}
      completions={options.completions}
      showBubble={options.showBubble}
    />
  );
};

interface Rigo {
  init: (token: string, options?: Options) => void;
  show: (params: Options) => void;
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
    let loglevel = "info";
    if (options.loglevel) {
      loglevel = options.loglevel;
    }
    logger.init(loglevel);

    logger.info("Initializing Rigobot!");
    const container = document.createElement("div");
    document.body.appendChild(container);

    this.container = container;
    this.options = options;
    this.token = token;
  },
  show: function (showOpts) {
    logger.debug("Trying to show Rigobot");
    if (this.container) {
      const options = {
        ...this.options,
        ...showOpts,
        collapsed:
          typeof showOpts.collapsed === "boolean" ? showOpts.collapsed : true,
      };

      this.options = options;

      logger.debug(`Options to init Rigo: ${options}`);

      if (!this.root) {
        this.root = ReactDOMClient.createRoot(this.container);
      }
      this.root.render(
        <React.StrictMode>
          <Rigobot chatAgentHash={this.token!} options={options} />
        </React.StrictMode>
      );
      logger.info("Rigobot is active!");
      return "Now Rigobot is active!";
    } else {
      logger.error(
        "You must call the rigo.init method before attempting to show the chat."
      );
    }
  },
  hide: function () {
    logger.debug("Hiding Rigobot");
    if (this.root) {
      this.root.unmount();
      logger.info("React DOM removed!");
    } else {
      logger.debug("Impossible to hide, a React root was not found!");
    }
  },
  updateContext: function ({ override = true, payload }) {
    logger.debug("Updating context for Rigobot");
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
    } else {
      logger.error(
        "A React root was not found! Impossible to update context, first init Rigobot"
      );
    }
  },
};
