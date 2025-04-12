import { Controller, Get } from '@nestjs/common';
import { NewsService } from './news.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('뉴스') // 그룹 이름
@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('fetch')
  fetchAllNews() {
    return this.newsService.fetchAllNews();
  }
}
