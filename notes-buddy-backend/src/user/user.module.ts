import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { userProvider } from './providers/user.provider';
import { CryptoModule } from '../crypto/crypto.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  controllers: [UserController],
  providers: [UserService, userProvider],
  imports: [CryptoModule, DatabaseModule],
  exports: [UserService],
})
export class UserModule {}
