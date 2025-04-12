import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('AI 트레이딩 에이전트 API')
    .setDescription('경제 뉴스 수집 및 에이전트 관리 API 문서입니다.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      displayRequestDuration: true, // 요청 시간 표시
      filter: true, // 필터 활성화
    },
  });

  app.enableCors({
    origin: 'http://localhost:3000', // 프론트엔드 도메인
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 쿠키 전달 허용
  });

  await app.listen(3001);
}
bootstrap();
