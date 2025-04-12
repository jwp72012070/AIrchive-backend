import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AiagentService {
  private openai: OpenAI;
  private supabase: SupabaseClient;
  private modelName = 'gpt-3.5-turbo'; // 모델 이름 설정
  private maxMessages = 10; // 최대 메시지 수 설정

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '', // 빈 문자열로 대체
    });
    // service_role 키 사용
    this.supabase = createClient(
      process.env.SUPABASE_URL || '', // 빈 문자열로 대체
      process.env.SUPABASE_KEY || '', // 빈 문자열로 대체
    );
  }

  async chat(userId: string, prompt: string): Promise<string> {
    try {
      // 1. 이전 대화 내용 가져오기
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase에서 대화 내용 가져오기 실패:', error);
        throw new Error('대화 내용을 가져오는 데 실패했습니다.');
      }

      let conversationHistory = messages
        ? messages.map((message) => ({
            role: message.role,
            content: message.content,
          }))
        : [];

      // 대화 내용이 없는 경우 초기 메시지 설정
      if (conversationHistory.length === 0) {
        conversationHistory = [
          { role: 'system', content: 'You are a helpful assistant.' },
        ];
      }

      // 2. 새로운 메시지 conversationHistory에 추가
      conversationHistory.push({ role: 'user', content: prompt });

      // 3. 메시지 수 제한
      if (conversationHistory.length > this.maxMessages) {
        // 오래된 대화 내용 삭제
        conversationHistory = conversationHistory.slice(-this.maxMessages); // 최근 10개 메시지만 유지
      }

      // 4. OpenAI API 호출
      const completion = await this.openai.chat.completions.create({
        messages: conversationHistory,
        model: this.modelName,
      });

      const response = completion.choices[0].message.content || ''; // 빈 문자열로 대체

      // 5. 새로운 응답 conversationHistory에 추가
      conversationHistory.push({ role: 'assistant', content: response });

      // 6. 데이터베이스에 대화 내용 저장
      await this.saveMessage(userId, 'user', prompt);
      await this.saveMessage(userId, 'assistant', response);

      return response;
    } catch (error) {
      console.error('OpenAI API 또는 Supabase 호출 중 오류 발생:', error);
      return 'API 호출 중 오류가 발생했습니다.';
    }
  }

  private async saveMessage(
    userId: string,
    role: 'user' | 'assistant',
    content: string,
  ): Promise<void> {
    const { error } = await this.supabase.from('messages').insert([
      {
        user_id: userId,
        role: role,
        content: content,
        created_at: new Date(),
      },
    ]);

    if (error) {
      console.error('Supabase에 메시지 저장 실패:', error);
      throw new Error('메시지를 저장하는 데 실패했습니다.');
    }
  }
}
