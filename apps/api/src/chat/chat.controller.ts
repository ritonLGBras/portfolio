import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('ask')
  async ask(@Body() body: { message: string; history: Array<{ role: string; content: string }> }) {
    return this.chatService.ask(body.message, body.history);
  }
}
