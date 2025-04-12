import { Controller, Post, Body, Query, BadRequestException } from '@nestjs/common';
import { AiagentService } from './aiagent.service';
import { validate as validateUUID } from 'uuid';
import { ApiQuery, ApiBody } from '@nestjs/swagger'; // Swagger 데코레이터 import

@Controller('aiagent')
export class AiagentController {
  constructor(private readonly aiagentService: AiagentService) {}

  @Post('chat')
  @ApiQuery({ name: 'userId', type: String, description: '사용자 ID (UUID 형식)' }) // userId 쿼리 파라미터 설명
  @ApiBody({ schema: { type: 'object', properties: { prompt: { type: 'string', description: 'AI에게 보낼 메시지' } } } }) // prompt 요청 바디 설명
  async chat(
    @Query('userId') userId: string,
    @Body('prompt') prompt: string,
  ): Promise<string> {
    // userId가 UUID 형식인지 검증
    if (!validateUUID(userId)) {
      throw new BadRequestException('Invalid user ID format. User ID must be a UUID.');
    }
    return this.aiagentService.chat(userId, prompt);
  }
}