import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AiagentService {
  private openai: OpenAI;
  private supabase: SupabaseClient;
  private modelName = 'gpt-3.5-turbo'; // Model name setting

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '', // Replace with an empty string
    });
    // Use service_role key
    this.supabase = createClient(
      process.env.SUPABASE_URL || '', // Replace with an empty string
      process.env.SUPABASE_KEY || '', // Replace with an empty string
    );
  }

  async chat(userId: string, prompt: string): Promise<string> {
    try {
      // 1. Get previous conversation history
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error(
          'Failed to retrieve conversation history from Supabase:',
          error,
        );
        throw new Error('Failed to retrieve conversation history.');
      }

      let conversationHistory = messages
        ? messages.map((message) => ({
            role: message.role,
            content: message.content,
          }))
        : [];

      // Set initial message (System prompt) if there is no conversation history
      if (conversationHistory.length === 0) {
        conversationHistory = [
          {
            role: 'system',
            content:
              'You are an AI Agent that provides investment advice and supports automated trading. Provide professional answers to questions related to finance, coins, and investment.',
          },
        ];
      }

      // 2. Check if the prompt is related to finance/coins/investment
      const isRelated = await this.isPromptRelatedToFinance(prompt);

      if (!isRelated) {
        return 'Please enter content related to finance/coins/investment.';
      }

      // 3. Add new message to conversationHistory
      conversationHistory.push({ role: 'user', content: prompt });

      // 4. Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        messages: conversationHistory,
        model: this.modelName,
      });

      const response = completion.choices[0].message.content || ''; // Replace with an empty string

      // 5. Add new response to conversationHistory
      conversationHistory.push({ role: 'assistant', content: response });

      // 6. Save conversation history to the database
      await this.saveMessage(userId, 'user', prompt);
      await this.saveMessage(userId, 'assistant', response);

      return response;
    } catch (error) {
      console.error(
        'Error occurred during OpenAI API or Supabase call:',
        error,
      );
      return 'An error occurred while processing the request.';
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
      console.error('Failed to save message to Supabase:', error);
      throw new Error('Failed to save the message.');
    }
  }

  // Function to check if the prompt is related to finance/coins/investment
  private async isPromptRelatedToFinance(prompt: string): Promise<boolean> {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant that determines whether a given text is related to finance, cryptocurrency, or investment, regardless of the language. 
            Respond with "true" if the text is related to finance, cryptocurrency, or investment. 
            Respond with "false" if the text is not related to finance, cryptocurrency, or investment.`,
          },
          { role: 'user', content: prompt },
        ],
        model: this.modelName,
      });

      const response = completion.choices[0].message.content || '';
      return response.trim().toLowerCase() === 'true';
    } catch (error) {
      console.error('Error occurred during OpenAI API call:', error);
      return false; // Return false safely in case of an error
    }
  }
}
