export interface JwtPayload {
  sub: string;
  sessionId: string;
  organizationId: string;
  type: 'access' | 'refresh';
}