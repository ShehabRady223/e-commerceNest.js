export type TokenType = 'access' | 'refresh';
export interface JwtPayload {
  id: string;
  name: string;
  role: string;
  type: TokenType;
}
