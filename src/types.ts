import MarkdownIt from "markdown-it";

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TCompletion = {
  prompt: string;
  answer: string;
  DOMTarget?: string;
};

export type TMessage = {
  text: string;
  type: "assistant" | "user";
};

export interface ChatMessagesProps {
  user: {
    context: string;
    token: string;
    avatar: string;
    nickname: string;
  };
  host: string;
  purposeId?: number;
  chatAgentHash: string;
  socketHost: string;
  closeChat: () => void;
  welcomeMessage: string;
  completions?: TCompletion[];
  backdropRef: any;
  introVideo?: TIntroVideo;
  purposeSlug?: string;
  setOriginElementBySelector: (selector: string) => void;
}

export interface ChatBubbleProps {
  user: {
    context: string;
    token: string;
    avatar: string;
    nickname: string;
  };
  welcomeMessage: string;
  host: string;
  purposeId?: number;
  chatAgentHash: string;
  socketHost: string;
  collapsed: boolean;
  originElement: Element | null;
  introVideo?: TIntroVideo;
  completions?: TCompletion[];
  showBubble?: boolean;
  purposeSlug?: string;
  highlight?: boolean;
  toggleCollapsed: () => void;
}

export type TIntroVideo = {
  url: string;
  desktopWidth?: string;
  desktopHeight?: string;
};

export interface Options {
  showBubble?: boolean;
  target?: string;
  welcomeMessage?: string;
  context?: string;
  introVideo?: TIntroVideo;
  completions?: TCompletion[];
  collapsed?: boolean;
  purposeId?: number;
  purposeSlug?: string;
  highlight?: boolean;
  loglevel?: "debug" | "info";
  bubblePosition?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  user?: {
    token?: string;
    avatar?: string;
    nickname?: string;
    context?: string;
  };
  socketHost?: string;
}

export interface RigobotProps {
  chatAgentHash: string;
  options: Options;
}

type TOnStartData = {
  when: string;
  url: string;
};

export interface TAskToRigobot {
  prompt: string;
  target: HTMLElement;
  previousMessages?: TMessage[];
  format?: "html" | "markdown";
  useVectorStore?: boolean;
  onComplete?: (success: boolean, data: any) => void;
  onStart?: (data: TOnStartData) => void;
}

export interface TCompleteWithRigo {
  templateSlug: string;
  payload: { [key: string]: string };
  format: "html" | "markdown";
  target: HTMLElement;
  onComplete: (success: boolean, data: any) => void;
  onStart?: (data: TOnStartData) => void;
}

export type TAskJob = {
  stop: () => void;
  run: () => void;
};
