import { createWithEqualityFn as create } from "zustand/traditional";
import { io, Socket } from "socket.io-client";

type TMessage = {
  text: string;
  sender: "ai" | "person";
};
type Store = {
  socket: Socket | null;
  showVideo: boolean;
  toggleVideo: () => void;
  messages: TMessage[];
  conversationId: string | null;
  setMessages: (messages: TMessage[]) => void;
  setConversationId: (conversationId: string | null) => void;
  connectSocket: ({ socketHost }: { socketHost: string }) => void;
};

export const useStore = create<Store>((set) => ({
  showVideo: true,
  socket: null,
  toggleVideo: () => set((state: any) => ({ showVideo: !state.showVideo })),
  messages: [],
  conversationId: null,
  setMessages: (messages) => {
    set({ messages: messages });
  },
  setConversationId: (conversationId) => {
    set({ conversationId: conversationId });
  },
  connectSocket: ({ socketHost }: { socketHost: string }) => {
    set({
      socket: io(socketHost),
    });
  },
}));
