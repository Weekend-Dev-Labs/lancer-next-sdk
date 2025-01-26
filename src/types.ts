export interface SessionAuthenticateOptions {
  accepts?: string[];
  maxSize?: number;
  minSize?: number;
  maxChunkCount?: number;
}

export interface SessionAuthGrant {
  status?: number;
  ownerId?: string;
  message?: string;
}
