import { Test, TestingModule } from '@nestjs/testing';
import { QueueProcessor } from './queue.service';

describe('QueueProcessor', () => {
  let service: QueueProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueProcessor],
    }).compile();

    service = module.get<QueueProcessor>(QueueProcessor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
