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
  debug: (msg: string) => {
    if (
      typeof logger.loglevel === "string" &&
      logger.loglevel.toLowerCase() === "debug"
    ) {
      console.log(`DEBUG: ${msg}`);
    }
  },
  info: (msg: string) => {
    if (
      typeof logger.loglevel === "string" &&
      (logger.loglevel.toLowerCase() === "info" ||
        logger.loglevel.toLowerCase() === "debug")
    ) {
      console.log(`INFO: ${msg}`);
    }
  },
  error: (msg: string) => {
    console.error(`ERROR: ${msg}`);
  },
};

export function convertMarkdownToHTML(markdownText: string) {
  const md = new MarkdownIt();
  return md.render(markdownText);
}
