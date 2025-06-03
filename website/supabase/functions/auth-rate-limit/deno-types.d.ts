// deno-types.d.ts
declare module 'https://deno.land/std@0.177.0/http/server.ts' {
  export interface ServeInit {
    port?: number;
    hostname?: string;
    handler: Handler;
    onError?: (error: unknown) => Response | Promise<Response>;
    signal?: AbortSignal;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export interface Handler {
    (request: Request, connInfo?: ConnInfo): Response | Promise<Response>;
  }
  
  export interface ConnInfo {
    readonly localAddr: Deno.Addr;
    readonly remoteAddr: Deno.Addr;
  }

  export function serve(handler: Handler, options?: number | ServeInit): Promise<void>;
}

declare namespace Deno {
  export interface Addr {
    transport: 'tcp' | 'udp';
    hostname: string;
    port: number;
  }
}
