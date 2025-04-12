import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NewsModule } from './news/news.module';
import { ConfigModule } from '@nestjs/config';
import { AiagentModule } from './aiagent/aiagent.module';

@Module({
  imports: [NewsModule, ConfigModule.forRoot({ isGlobal: true }), AiagentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}