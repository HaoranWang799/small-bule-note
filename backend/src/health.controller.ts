import { Controller, Get } from '@nestjs/common';
import { RedisService } from './common/redis/redis.service';

@Controller('health')
export class HealthController {
  constructor(private readonly redisService: RedisService) {}

  @Get()
  async getHealth() {
    let redisStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      const pong = await this.redisService.getClient().ping();
      redisStatus = pong === 'PONG' ? 'connected' : 'disconnected';
    } catch {
      redisStatus = 'disconnected';
    }

    return {
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        redis: redisStatus,
      },
    };
  }
}
