export interface Message {
  id: number;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}
