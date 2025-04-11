declare module 'groq-sdk' {
    export class Groq {
      constructor(options: { apiKey: string | undefined });
  
      chat: {
        completions: {
          create(params: {
            messages: Array<{
              role: string;
              content: string;
            }>;
            model: string;
            temperature?: number;
            max_tokens?: number;
          }): Promise<{
            choices: Array<{
              message?: {
                content: string;
              };
            }>;
          }>;
        };
      };
  
      audio: {
        transcriptions: {
          create(params: {
            model: string;
            file: string | Buffer;
            response_format?: string;
            language?: string;
          }): Promise<{
            text: string;
          }>;
        };
      };
    }
  }