import { useEffect } from "react";
import hljs from "highlight.js";
import "highlight.js/styles/atom-one-dark.css";
import Markdown from "react-markdown";
import { StyledMarkdown } from "../ChatBubble/ChatBubbleStyles";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { twilight } from "react-syntax-highlighter/dist/esm/styles/prism";

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
          pre(props) {
            const codeBlocks = props.node?.children.map((child) => {
              // @ts-ignore
              const code = child.children.map((c) => c.value).join("");
              // @ts-ignore
              const classNames = child.properties?.className;
              let lang = "text";
              if (classNames && classNames?.length > 0) {
                lang = classNames[0].split("-")[1];
              }
              return {
                lang,
                code,
              };
            });
            if (!codeBlocks || codeBlocks.length === 0) {
              return <pre>{props.children}</pre>;
            }
            return (
              <SyntaxHighlighter language={codeBlocks[0].lang} style={twilight}>
                {codeBlocks[0].code}
              </SyntaxHighlighter>
            );
          },
        }}
      >
        {markdown}
      </Markdown>
    </StyledMarkdown>
  );
};

export default MarkdownRenderer;
