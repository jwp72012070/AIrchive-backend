import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { supabase } from '../supbase.client';

@Injectable()
export class NewsService {
  // async fetchNaverNews() {
  //   const res = await axios.get(
  //     'https://openapi.naver.com/v1/search/news.json',
  //     {
  //       params: {
  //         query: '경제',
  //         display: 50,
  //         sort: 'date',
  //       },
  //       headers: {
  //         'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
  //         'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
  //       },
  //     },
  //   );

  //   for (const item of res.data.items) {
  //     const { data: existing } = await supabase
  //       .from('news')
  //       .select('id')
  //       .eq('url', item.link);

  //     if (!existing || existing.length === 0) {
  //       await supabase.from('news').insert({
  //         source: 'Naver',
  //         title: item.title.replace(/<[^>]*>?/gm, ''), // HTML 제거
  //         url: item.link,
  //         published_at: new Date(item.pubDate),
  //       });
  //     }
  //   }
  // }

  async fetchGlobalNews() {
    console.log('NYT API KEY:', process.env.NYT_API_KEY);

    const res = await axios.get(
      'https://api.nytimes.com/svc/topstories/v2/business.json',
      {
        params: {
          'api-key': process.env.NYT_API_KEY,
        },
      },
    );

    console.log('NYT 결과 수:', res.data.results.length); // 🔍 확인용

    for (const article of res.data.results) {
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('url', article.url);

      if (!existing || existing.length === 0) {
        await supabase.from('news').insert({
          source: 'NYTimes',
          title: article.title,
          description: article.abstract,
          url: article.url,
          published_at: new Date(article.published_date),
        });
      }
    }
  }

  async fetchAllNews() {
    // await this.fetchNaverNews();
    await this.fetchGlobalNews();
    const { data } = await supabase
      .from('news')
      .select('*')
      .eq('source', 'NYTimes') // 🔥 이 부분 추가
      .order('published_at', { ascending: false })
      .limit(10);

    return data;
  }
}
