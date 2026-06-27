// ============================================================
// 道之自然·命理AI系统 — Wuxing模块：服务（直接实例化引擎）
// ============================================================

import { Injectable } from '@nestjs/common';
import { WuxingEngine } from '../../engines';

@Injectable()
export class WuxingService {
  private readonly engine = new WuxingEngine();

  analyzeEnergy(data: any) {
    return this.engine.calculateEnergyField(data);
  }
}
