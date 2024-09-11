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
  purposeId: number;
  chatAgentHash: string;
  socketHost: string;
  closeChat: () => void;
  welcomeMessage: string;
  completions?: TCompletion[];
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
  purposeId: number;
  chatAgentHash: string;
  socketHost: string;
  collapsed: boolean;
  originElement: Element | null;
  introVideoUrl: string;
  completions?: TCompletion[];
}
