import React from "react";
import ReactDOMClient from "react-dom/client";

import { Options } from "./types.ts";
import { logger } from "./utils/utilities.ts";
import { Rigobot } from "./components/Rigobot/Rigobot.tsx";

interface Rigo {
  init: (token: string, options?: Options) => void;
  show: (params: Options) => void;
  hide: () => void;
  updateOptions: (newOptions: Options) => void;
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
    logger.info("Showing Rigobot");
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

  updateOptions: function (newOptions: Options) {
    logger.debug("Updating options for Rigobot");
    this.options = { ...this.options, ...newOptions };
    logger.info("Options updated to: ", this.options);

    console.log(this.options, "OPTIONS");

    const event = new CustomEvent("optionsUpdated", { detail: this.options });
    window.dispatchEvent(event);
  },
};
