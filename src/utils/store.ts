import { createWithEqualityFn as create } from "zustand/traditional";

type TMessage = {
  text: string;
  sender: "ai" | "person";
};
type Store = {
  showVideo: boolean;
  toggleVideo: () => void;
  messages: TMessage[];
  setMessages: (messages: TMessage[]) => void;
};

export const useStore = create<Store>((set) => ({
  showVideo: true,
  toggleVideo: () => set((state: any) => ({ showVideo: !state.showVideo })),
  messages: [],
  setMessages: (messages) => {
    set({messages: messages});
  },
}));
