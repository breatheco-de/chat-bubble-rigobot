import React, { useEffect } from "react";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";

const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }
    return "";
  },
});

const MarkdownRenderer = ({ markdown }: { markdown: string }) => {
  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
        // @ts-ignore
      hljs.highlightBlock(block);
    });
  }, [markdown]);

  const getMarkdownText = () => {
    const rawMarkup = md.render(markdown);
    return { __html: rawMarkup };
  };

  return <div dangerouslySetInnerHTML={getMarkdownText()} />;
};

export default MarkdownRenderer;
