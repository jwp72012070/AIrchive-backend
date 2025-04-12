import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { supabase } from '../supbase.client';

@Injectable()
export class NewsService {
  async fetchNaverNews() {
    const res = await axios.get(
      'https://openapi.naver.com/v1/search/news.json',
      {
        params: {
          query: '경제',
          display: 50,
          sort: 'date',
        },
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
        },
      },
    );

    for (const item of res.data.items) {
      const { data: existing } = await supabase
        .from('news')
        .select('id')
        .eq('url', item.link);

      if (!existing || existing.length === 0) {
        await supabase.from('news').insert({
          source: 'Naver',
          title: item.title.replace(/<[^>]*>?/gm, ''), // HTML 제거
          url: item.link,
          published_at: new Date(item.pubDate),
        });
      }
    }
  }

  // async fetchGlobalNews() {
  //   const res = await axios.get('https://newsapi.org/v2/top-headlines', {
  //     params: {
  //       category: 'business',
  //       language: 'en',
  //       pageSize: 10,
  //       apiKey: process.env.NEWS_API_KEY,
  //     },
  //   });

  //   for (const article of res.data.articles) {
  //     const { data: existing } = await supabase
  //       .from('news')
  //       .select('id')
  //       .eq('url', article.url);

  //     if (!existing || existing.length === 0) {
  //       await supabase.from('news').insert({
  //         source: 'NewsAPI',
  //         title: article.title,
  //         url: article.url,
  //         published_at: new Date(article.publishedAt),
  //       });
  //     }
  //   }
  // }

  async fetchAllNews() {
    await this.fetchNaverNews();
    // await this.fetchGlobalNews();
    const { data } = await supabase
      .from('news')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(10);

    return data;
  }
}
