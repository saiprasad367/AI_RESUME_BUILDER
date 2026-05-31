import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Polyfill WebSocket on the server to prevent Supabase client constructor
// from throwing in Node.js < 22 during server-side rendering (SSR).
if (typeof window === "undefined" && !globalThis.WebSocket) {
  globalThis.WebSocket = class {
    static CONNECTING = 0;
    static OPEN = 1;
    static CLOSING = 2;
    static CLOSED = 3;
    
    constructor() {
      throw new Error("WebSockets are not supported or needed on the server side.");
    }
  } as any;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

