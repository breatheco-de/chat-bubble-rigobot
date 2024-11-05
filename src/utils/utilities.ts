import MarkdownIt from "markdown-it";

export function extractMovetoContent(text: string): {
  targetElement: string | null;
  textWithoutTags: string;
} {
  const movetoRegex = /<moveto>(.*?)<\/moveto>/;
  const match = text.match(movetoRegex);

  let targetElement = null;
  let textWithoutTags = text;

  if (match && match[1]) {
    targetElement = match[1];
    textWithoutTags = text.replace(movetoRegex, "");
  }

  return { targetElement, textWithoutTags };
}

export const logger = {
  loglevel: "",
  init: (loglevel: string) => {
    logger.loglevel = loglevel;
  },
  log: (...args: any[]) => {
    console.log(...args); // This will log any number of arguments passed to it
  },
  debug: (...args: any[]) => {
    if (
      typeof logger.loglevel === "string" &&
      logger.loglevel.toLowerCase() === "debug"
    ) {
      console.log(`DEBUG:`, ...args); // Log multiple arguments
    }
  },
  info: (...args: any[]) => {
    if (
      typeof logger.loglevel === "string" &&
      (logger.loglevel.toLowerCase() === "info" ||
        logger.loglevel.toLowerCase() === "debug")
    ) {
      console.log(`INFO:`, ...args); // Log multiple arguments
    }
  },
  error: (...args: any[]) => {
    console.error(`ERROR:`, ...args); // Log multiple arguments
  },
};

export function convertMarkdownToHTML(markdownText: string) {
  const md = new MarkdownIt();
  return md.render(markdownText);
}

export const createContext = (
  userContext: string,
  completions: string,
  prevConversation: string
) => {
  const innerContext = `
  This context is related to the user and the environment:
  """
  ${userContext}
  """

  Think about the following completions (if available) as a source of proven information about the website in general. If the user message can be answered using one of the following completions, return its answer.
  """
  ${completions}
  """

  In the cases where you use one of the (always one at a time) please return inside an xml <moveto> like the follwing at the end of your response: 
  <moveto>DOMTarget</moveto>

  This will move the chat bubble where your answer are being displayed to an element the user should see. THIS IS MANDATORY is you are using information from the provided completions and the completion have a 'DOMTarget' property.
  Inside the XML tag must be DOMTarget selector is provided. Else please do not add the XML tag.

  Here is the previous conversation, follow it naturally:
  """
  ${prevConversation}
  """
  `;

  return innerContext;
};

type initConversationOptions = {
  chatAgentHash: string;
  userToken: string;
  host: string;
  purposeId?: number;
  purposeSlug?: string;
};

export const initConversation = async ({
  chatAgentHash,
  userToken,
  host,
  purposeId,
  purposeSlug,
}: initConversationOptions) => {
  const headers = {
    "Content-Type": "application/json",
    "Chat-Agent-Hash": chatAgentHash,
    Authorization: `Token ${userToken || chatAgentHash}`,
  };

  try {
    const res = await fetch(
      `${host}/v1/conversation/?purpose=${purposeId || purposeSlug}`,
      {
        method: "POST",
        headers,
        body: null,
      }
    );

    if (!res.ok) {
      console.log(res);
      res;
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const json = await res.json();
    return json;
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
};
