import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { VoiceChatService } from './voice-chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/voice-chat',
  maxHttpBufferSize: 25 * 1024 * 1024,
})
export class VoiceChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(VoiceChatGateway.name);

  constructor(private readonly voiceChatService: VoiceChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('startSession')
  async handleStartSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { email: string },
  ) {
    try {
      if (!data.email?.trim()) {
        client.emit('error', { message: 'Email is required.' });
        return;
      }
      const result = await this.voiceChatService.startSession(
        data.email.trim(),
      );
      client.emit('sessionStarted', {
        sessionId: result.sessionId,
        participantId: result.participantId,
        greeting: result.greeting,
      });
    } catch (err) {
      this.logger.error(`startSession: ${(err as Error).message}`);
      client.emit('error', { message: 'Failed to start session.' });
    }
  }

  @SubscribeMessage('audioMessage')
  async handleAudioMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; audio: string },
  ) {
    try {
      if (!data.sessionId || !data.audio) {
        client.emit('error', { message: 'sessionId and audio required.' });
        return;
      }

      client.emit('processing', { status: 'Gemini is listening...' });

      const result = await this.voiceChatService.processAudioMessage(
        data.sessionId,
        data.audio, // base64 string passed directly to Gemini
      );

      client.emit('aiResponse', {
        text: result.text,
        extractedData: result.extractedData,
        isComplete: result.isComplete,
      });

      if (result.isComplete) {
        client.emit('registrationComplete', {
          message: 'Registration complete!',
          extractedData: result.extractedData,
        });
      }
    } catch (err) {
      this.logger.error(`audioMessage: ${(err as Error).message}`);
      client.emit('error', { message: 'Audio processing failed.' });
    }
  }

  @SubscribeMessage('userMessage')
  async handleUserMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string; text: string },
  ) {
    try {
      if (!data.sessionId || !data.text) {
        client.emit('error', { message: 'sessionId and text required.' });
        return;
      }
      client.emit('processing', { status: 'Gemini is thinking...' });
      const result = await this.voiceChatService.processTextMessage(
        data.sessionId,
        data.text.trim(),
      );
      client.emit('aiResponse', {
        text: result.text,
        extractedData: result.extractedData,
        isComplete: result.isComplete,
      });
      if (result.isComplete) {
        client.emit('registrationComplete', {
          message: 'Registration complete!',
          extractedData: result.extractedData,
        });
      }
    } catch (err) {
      this.logger.error(`userMessage: ${(err as Error).message}`);
      client.emit('error', { message: 'Something went wrong.' });
    }
  }

  @SubscribeMessage('endSession')
  handleEndSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    this.logger.log(`Session ended: ${data.sessionId}`);
    client.emit('sessionEnded', { sessionId: data.sessionId });
  }
}
