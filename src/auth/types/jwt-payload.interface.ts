import { TokenType } from './token-type.enum';

export interface JwtPayload {
  emailAddress: string;
  name: string;
  type: TokenType;
}
