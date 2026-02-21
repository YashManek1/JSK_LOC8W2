import { Module } from '@nestjs/common';
import { Aes256Service } from './aes256.service';

@Module({
  providers: [Aes256Service],
  exports: [Aes256Service],
})
export class SecurityModule {}
