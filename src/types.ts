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
  userMessage?: {
    text: string;
    autoSend?: boolean;
  };
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
  userMessage?: {
    text: string;
    autoSend?: boolean;
  };
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
  userMessage?: {
    text: string;
    autoSend?: boolean;
  };
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
  pusherKey?: string;
  pusherCluster?: string;
  apiHost?: string;
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
  target?: HTMLElement;
  previousMessages?: TMessage[];
  format?: "html" | "markdown";
  useVectorStore?: boolean;
  // stream?: boolean;
  onComplete?: (success: boolean, data: any) => void;
  onStart?: (data: TOnStartData) => void;
  onStream?: (data: TOnStreamData) => void;
}

export type TToolSchema = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: {
      type: "object";
      properties: Record<string, TToolArguments>;
      required: string[];
      additionalProperties: boolean;
    };
    strict: boolean;
    required: string[];
    additionalProperties: boolean;
  };
};


export type TTool = {
  schema: TToolSchema;
  function: (args: Record<string, any>) => Promise<string>;
};

type TToolArguments = {
  type: string;
  description: string;
};

export const toolify = <T extends (args: any) => any>(
  fn: T,
  name: string,
  description: string,
  argumentsMap: Record<string, TToolArguments>
): TTool => {
  const properties: Record<string, TToolArguments> = {};
  const required: string[] = [];

  for (const key of Object.keys(argumentsMap)) {
    properties[key] = {
      type: typeof argumentsMap[key].type,
      description: argumentsMap[key].description,
    };
  }
  if (typeof fn === "function") {
    for (const key of Object.keys(argumentsMap)) {
      required.push(key);
      properties[key] = {
        type: typeof (fn as any)[key] === "number" ? "number" : "string",
        description: `${argumentsMap[key].description}`,
      };
    }
  }

  return {
    schema: {
      type: "function",
      function: {
        name,
        description,
        parameters: {
          type: "object",
          properties,
          required,
          additionalProperties: false,
        },
        strict: true,
        required: Object.keys(argumentsMap),
        additionalProperties: false,
      },
    },
    function: fn,
  };
};

export interface TAgentLoop {
  task: string;
  tools: TTool[];
  context: string;
  onMessage?: (message: string) => void;
  onComplete?: (success: boolean, data: any) => void;
  target?: HTMLElement;
  previousMessages?: TMessage[];
}

export type TAgentJob = {
  stop: () => void;
  run: () => void;
};

type TOnStreamData = {
  chunk: string;
  cumulative: string;
};

export interface TCompleteWithRigo {
  templateSlug: string;
  payload?: { [key: string]: string };
  format?: "html" | "markdown";
  target?: HTMLElement;
  stream?: boolean;
  onComplete?: (success: boolean, data: any) => void;
  onStart?: (data: TOnStartData) => void;
  onStream?: (data: TOnStreamData) => void;
}

export interface TUseTemplateWithRigo {
  templateSlug: string;
  payload?: { [key: string]: string };
  format?: "html" | "markdown";
  target?: HTMLElement;
  onComplete?: (success: boolean, data: any) => void;
  onStart?: (data: TOnStartData) => void;
}

export type TAskJob = {
  stop: () => void;
  run: () => void;
};
