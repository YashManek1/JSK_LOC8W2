import { Module } from '@nestjs/common';
import { VoiceChatController } from './voice-chat.controller';
import { VoiceChatService } from './voice-chat.service';
import { VoiceChatGateway } from './voice-chat.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [VoiceChatController],
  providers: [VoiceChatService, VoiceChatGateway],
})
export class VoiceChatModule {}
