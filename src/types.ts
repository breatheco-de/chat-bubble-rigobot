/* eslint-disable @typescript-eslint/no-explicit-any */
export type TCompletion = {
  prompt: string;
  answer: string;
  DOMTarget?: string;
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
  bubblePosition?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
  highlight?: boolean;
  loglevel?: "debug" | "info";
}

export interface RigobotProps {
  chatAgentHash: string;
  options: Options;
}
