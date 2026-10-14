export interface SaveFileOptions {
  defaultName?: string;
  content: string;
  filters?: Array<{ name: string; extensions: string[] }>;
}

export interface SaveFileResult {
  canceled: boolean;
  filePath?: string;
  error?: string;
}

export interface OpenFileOptions {
  filters?: Array<{ name: string; extensions: string[] }>;
}

export interface OpenFileResult {
  canceled: boolean;
  filePath?: string;
  fileName?: string;
  content?: string;
  error?: string;
}

export interface SystemInfo {
  isNative: boolean;
  platform: string;
  arch: string;
  electronVersion: string;
  nodeVersion: string;
  memoryUsageMB: number;
}

export interface ApexNativeApi {
  isNativeWindows: boolean;
  saveFile: (options: SaveFileOptions) => Promise<SaveFileResult>;
  openFile: (options: OpenFileOptions) => Promise<OpenFileResult>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  getSystemInfo: () => Promise<SystemInfo>;
}

declare global {
  interface Window {
    apexNative?: ApexNativeApi;
  }
}
