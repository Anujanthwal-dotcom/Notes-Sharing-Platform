import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { NoteModule } from './note/note.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SearchModule } from './search/search.module';
import { AuthModule } from './auth/auth.module';
import { CryptoModule } from './crypto/crypto.module';
import { JwtMiddleware } from './middleware/jwt.middleware';
import { UserController } from './user/user.controller';
import { NoteController } from './note/note.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { EmailModule } from './email/email.module';
import { ScannerModule } from './scanner/scanner.module';
import { StorageModule } from './storage/storage.module';
import { CollegeModule } from './college/college.module';
import { AdminModule } from './admin/admin.module';
import { AdminMiddleware } from './middleware/admin.middleware';
import { AdminController } from './admin/admin.controller';
import { SearchController } from './search/search.controller';
import { CourseModule } from './course/course.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 10 * 60 * 1000,
    }),
    UserModule,
    DatabaseModule,
    NoteModule,
    AnalyticsModule,
    SearchModule,
    AuthModule,
    CollegeModule,
    AdminModule,
    CourseModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(UserController, NoteController, SearchController);
    consumer.apply(AdminMiddleware).forRoutes(AdminController);
  }
}
