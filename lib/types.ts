export type ResponseMode = "text" | "voice";

export type ToolName = "Calculator" | "Web Search" | "Code Interpreter";

export interface ToolUsage {
  name: ToolName;
  input?: string;
  output?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  tool?: ToolUsage;
  audioUrl?: string;
}
