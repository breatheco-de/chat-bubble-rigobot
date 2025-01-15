import { useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import Markdown from "react-markdown";
import { StyledMarkdown } from "../ChatBubble/ChatBubbleStyles";

const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block as HTMLElement);
    });
  }, [markdown]);

  return (
    <StyledMarkdown>
      <Markdown
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </StyledMarkdown>
  );
};

export default MarkdownRenderer;
