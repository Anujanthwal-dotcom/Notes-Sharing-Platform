import { Injectable } from '@nestjs/common';
import * as bcypto from 'bcrypt';
@Injectable()
export class CryptoService {
  async encrypt(password: string): Promise<string> {
    return await bcypto.hash(password, 10);
  }
}
