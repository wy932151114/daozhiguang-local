// ============================================================
// 道之自然·命理AI系统 — 根模块（Full Mode）
// 无数据库依赖，纯引擎计算 + API路由
// ============================================================

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

// 核心引擎模块（无数据库依赖）
import { BaziModule } from './modules/bazi/bazi.module';
import { WuxingModule } from './modules/wuxing/wuxing.module';
import { JiugongModule } from './modules/jiugong/jiugong.module';
import { DayunModule } from './modules/dayun/dayun.module';
import { ShenshaModule } from './modules/shensha/shensha.module';
import { AiModule } from './modules/ai/ai.module';

// Web Console API（统一路由出口）
import { WebConsoleModule } from './modules/web-console/web-console.module';

@Module({
  imports: [
    // 配置
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 限流保护
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 60,
    }]),

    // 核心引擎模块
    BaziModule,
    WuxingModule,
    JiugongModule,
    DayunModule,
    ShenshaModule,
    AiModule,

    // Web Console API（所有6个端点由此提供）
    WebConsoleModule,
  ],
})
export class AppModule {}
