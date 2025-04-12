import { Module } from '@nestjs/common';
import { AiagentController } from './aiagent.controller';
import { AiagentService } from './aiagent.service';

@Module({
  controllers: [AiagentController],
  providers: [AiagentService],
})
export class AiagentModule {}