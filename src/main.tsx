import React from "react";
import ReactDOMClient from "react-dom/client";

import { Options } from "./types.ts";
import { logger } from "./utils/utilities.ts";
import { Rigobot } from "./components/Rigobot/Rigobot.tsx";

interface Rigo {
  init: (token: string, options?: Options) => void;
  show: (params: Options) => void;
  hide: () => void;
  on: (event: string, callback: (data: any) => void) => void;
  updateOptions: (newOptions: Options) => void;
  callbacks: {
    [key: string]: (data: any) => void;
  };
  // callbackDescriptions: {
  //   [key: string]: string;
  // };
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
    if (this.container) {
      const options = {
        ...this.options,
        ...showOpts,
        collapsed:
          typeof showOpts.collapsed === "boolean" ? showOpts.collapsed : true,
      };

      this.options = options;

      console.log("Initializing Rigobot with options: ", options);

      if (!this.root) {
        this.root = ReactDOMClient.createRoot(this.container);
      }
      this.root.render(
        <React.StrictMode>
          <Rigobot chatAgentHash={this.token!} options={this.options} />
        </React.StrictMode>
      );
      logger.info("Calling show method", "Rigobot is active!");
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
  on: function (event: string, callback: (data: any) => void) {
    this.callbacks[event] = callback;
  },
  callbacks: {},
  // callbackDescriptions: {
  //   open_bubble: "This callback is triggered when the bubble is opened.",
  //   close_bubble: "This callback is triggered when the bubble is closed.",
  //   outgoing_message:
  //     "This callback is triggered when the user sends a message to the bot.",
  //   incoming_message:
  //     "This callback is triggered when the bot finish processing the user message.",
  // },

  updateOptions: function (newOptions: Options) {
    logger.debug("Updating options for Rigobot");
    console.log(`Previous collapsed state: ${this.options?.collapsed}`);
    console.log(`Incoming collapsed state: ${newOptions.collapsed}`);
    if (newOptions.collapsed === undefined) {
      newOptions.collapsed = this.options?.collapsed;
    }

    this.options = { ...this.options, ...newOptions };
    logger.info("Options updated to: ", this.options);

    const event = new CustomEvent("optionsUpdated", { detail: this.options });
    window.dispatchEvent(event);
  },
};
