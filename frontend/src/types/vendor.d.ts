declare module "react-syntax-highlighter" {
  import type { ComponentType } from "react";

  export const Prism: ComponentType<{
    language?: string;
    style?: Record<string, unknown>;
    PreTag?: string;
    children?: React.ReactNode;
  }>;
}

declare module "react-syntax-highlighter/dist/esm/styles/prism" {
  export const oneDark: Record<string, unknown>;
}

declare module "react-copy-to-clipboard" {
  import type { ComponentType, ReactNode } from "react";

  export const CopyToClipboard: ComponentType<{
    text: string;
    onCopy?: () => void;
    children: ReactNode;
  }>;
}
