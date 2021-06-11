import { TokenType } from './token-type.enum';

export interface JwtPayload {
  emailAddress: string;
  firstName: string;
  lastName?: string;
  type: TokenType;
}
