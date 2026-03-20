import { Module } from '@nestjs/common';
import { ContentModule } from './content/content.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [ContentModule, ChatModule],
})
export class AppModule {}
