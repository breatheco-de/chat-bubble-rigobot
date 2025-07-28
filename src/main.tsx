import React from "react";
import ReactDOMClient from "react-dom/client";

import { Options, TAskJob, TAskToRigobot, TCompleteWithRigo } from "./types.ts";
import { generateRandomId, logger, convertToHTML } from "./utils/utilities.ts";
import { Rigobot } from "./components/Rigobot/Rigobot.tsx";

import packageJson from "../package.json";

import io from "socket.io-client";

interface Rigo {
  init: (token: string, options?: Options) => void;
  show: (params: Options) => void;
  hide: () => void;
  ask: (TAskToRigobot: TAskToRigobot) => TAskJob | undefined;
  complete: (TCompleteWithRigo: TCompleteWithRigo) => void;
  // stopGeneration: () => void;
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
  version?: string;
}

declare global {
  interface Window {
    rigo: Rigo;
  }
}

const validFormats = ["html", "markdown"];

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

      console.log("Showing Rigobot with options: ", options);

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
  ask: function ({
    prompt,
    target,
    previousMessages = [],
    useVectorStore = true,
    format = "markdown",
    // stream = false,
    onComplete,
    onStart,
    onStream,
  }: TAskToRigobot) {
    logger.debug("Asking Rigobot a question");

    if (!this.options?.purposeSlug) {
      logger.error(
        "No purpose slug provided, call rigo.init first and provide a purposeSlug"
      );
      onComplete?.(false, { error: "No purpose slug provided" });
      return;
    }

    if (!this.token) {
      logger.error(
        "No token provided, call rigo.init first and provide a token"
      );
      onComplete?.(false, { error: "No token provided" });
      return;
    }

    if (!prompt) {
      logger.error("No prompt provided");
      onComplete?.(false, { error: "No prompt provided" });
      return;
    }

    let temporalSocket = io(
      this.options?.socketHost ?? "https://ai.4geeks.com"
    );

    const jobId = generateRandomId();
    let started = false;

    if (!target && !onComplete) {
      logger.error(
        "No target or onComplete provided, please set one of them to use the ask method"
      );
      return;
    }

    if (target && !(target instanceof HTMLElement)) {
      const eMessage = "Target is not an HTMLElement";
      console.log(target);

      logger.error(eMessage);
      onComplete?.(false, { error: eMessage });
      return;
    }

    temporalSocket?.on(`answer-stream-${jobId}`, (data: any) => {
      if (!started) {
        onStart?.({
          when: new Date().toISOString(),
          url: window.location.href,
        });
        started = true;
      }

      if (target && format === "markdown") {
        target.innerHTML += data.chunk;
      } else if (target && format === "html") {
        target.innerHTML = convertToHTML(data.cumulative);
      } else {
        logger.error("Target is not an HTMLElement or format is not supported");
      }

      onStream?.({
        chunk: data.chunk,
        cumulative: data.cumulative,
      });
    });

    temporalSocket?.on(`answer-stream-end-${jobId}`, (data: any) => {
      onComplete?.(true, data);
      temporalSocket?.disconnect();
    });

    const job: TAskJob = {
      stop: () => {
        temporalSocket?.off(`answer-stream-end-${jobId}`);
        temporalSocket?.off(`answer-stream-${jobId}`);
        temporalSocket?.disconnect();
      },

      run: () => {
        temporalSocket?.emit("ask", {
          jobId,
          message: {
            text: prompt,
            image: null,
          },
          // stream: stream,

          purpose: {
            slug: this.options?.purposeSlug,
            id: this.options?.purposeId,
          },
          context: {
            extra: this.options?.context,
            previousMessages: previousMessages,
            useVectorStore: useVectorStore,
          },
          auth: {
            token: this.token,
          },
        });
      },
    };

    return job;
  },

  complete: function ({
    templateSlug,
    payload = {},
    format = "html",
    stream = false,
    target,
    onComplete,
    onStart,
    onStream,
  }: TCompleteWithRigo) {
    logger.debug("Completing Rigobot");

    if (!templateSlug) {
      logger.error("No template slug provided");
      onComplete?.(false, { error: "No template slug provided" });
      return;
    }

    if (!target && !onComplete) {
      logger.error(
        "No target or onComplete provided, please set one of them to use the complete method"
      );
      return;
    }

    if (target && !(target instanceof HTMLElement)) {
      logger.error("Target is not an HTMLElement");
      onComplete?.(false, {
        error: "Target is not an HTMLElement",
      });
      return;
    }

    if (!payload) {
      logger.error("No payload provided");
      onComplete?.(false, { error: "No payload provided" });
      return;
    }

    if (!validFormats.includes(format)) {
      logger.error(
        `Invalid format ${format} provided, valid formats are: ${validFormats.join(
          ", "
        )}`
      );
      onComplete?.(false, { error: `Invalid format ${format} provided` });
      return;
    }

    if (!this.options?.user?.token) {
      logger.error(
        "No user token provided, currently, only user token can be used to use a template"
      );
      console.log("Current RigoAI options", this.options);

      return;
    }

    let temporalSocket = io(
      this.options?.socketHost ?? "https://ai.4geeks.com"
    );
    const jobId = generateRandomId();
    let started = false;

    temporalSocket?.on(`completion-stream-${jobId}`, (data: any) => {
      if (!started) {
        onStart?.({
          when: new Date().toISOString(),
          url: window.location.href,
        });
        started = true;
      }

      if (target && format === "markdown") {
        target.innerHTML += data.chunk;
      } else if (target && format === "html") {
        target.innerHTML = convertToHTML(data.cumulative);
      } else {
        logger.error("Target is not an HTMLElement or format is not supported");
      }

      onStream?.({
        chunk: data.chunk,
        cumulative: data.cumulative,
      });
    });

    temporalSocket?.on(`completion-stream-end-${jobId}`, (data: any) => {
      onComplete?.(true, data);
      temporalSocket?.disconnect();
    });

    temporalSocket?.on(`error-${jobId}`, (data: any) => {
      onComplete?.(false, data);
    });

    const job: TAskJob = {
      stop: () => {
        temporalSocket?.off(`completion-stream-end-${jobId}`);
        temporalSocket?.off(`completion-stream-${jobId}`);
        temporalSocket?.disconnect();
      },

      run: () => {
        temporalSocket?.emit("complete", {
          jobId,
          inputs: payload,
          templateSlug,
          includePurposeBrief: false,
          stream: stream,
          auth: {
            token: this.options?.user?.token,
          },
          purpose: {
            slug: this.options?.purposeSlug,
            id: this.options?.purposeId,
          },
        });
      },
    };

    return job;
  },

  updateOptions: function (newOptions: Options) {
    if (newOptions.collapsed === undefined) {
      newOptions.collapsed = this.options?.collapsed;
    }

    this.options = { ...this.options, ...newOptions };
    logger.debug("Options updated to: ", this.options);

    const event = new CustomEvent("optionsUpdated", { detail: this.options });
    window.dispatchEvent(event);
  },
  version: packageJson.version,
};
