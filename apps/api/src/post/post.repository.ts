import { Injectable } from '@nestjs/common';
import { PostStatus } from '@prisma/client';
import { RedisService } from 'src/redis/services/redis.service';

@Injectable()
export class PostRepository {
  constructor(private readonly redisService: RedisService) {}
  async invalidatePostCommentsCache(postId: string) {
    if (!this.redisService) return;

    // // الحصول على جميع مفاتيح الكاش المرتبطة بهذا المنشور
    const pattern = `post_comments:${postId}:*`;
    const keys = await this.redisService.keys(pattern);

    // حذف جميع المفاتيح
    if (keys && keys.length > 0) {
      await Promise.all(keys.map((key) => this.redisService.del(key)));
    }
  }

  getPostStatus(status:string) {
    switch (status) {
      case 'PUBLISHED':
        return PostStatus.PUBLISHED;
      case 'DRAFT':
        return PostStatus.DRAFT;
      case "DELETED":
        return PostStatus.DELETED;
      default:
        return PostStatus.PUBLISHED;
    }
  }
}
