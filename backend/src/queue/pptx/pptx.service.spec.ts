import { Test, TestingModule } from '@nestjs/testing';
import { PptxService } from './pptx.service';

describe('PptxService', () => {
  let service: PptxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PptxService],
    }).compile();

    service = module.get<PptxService>(PptxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
