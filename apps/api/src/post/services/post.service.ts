import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/services/redis.service';
import { Queue } from 'bullmq';
import { UserRepository } from 'src/user/user.repository';
import { PostStatus, PostTag, Tag } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PostRepository } from '../post.repository';
import { CACHE_TTL } from 'src/constants';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly redisService: RedisService,
    private readonly postRepository: PostRepository,
  ) {}

  async getPosts(
    limit = 10,
    page = 1,
    sortBy: string = 'desc',
    categoryId?: string | null,
    tagId?: string | null,
    token?: any,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    const sortByValue = sortBy === 'desc' ? 'desc' : 'asc';

    // استخراج معرف المستخدم من الرمز المميز إذا وجد
    let userId: string | null = null;
    let userProfileId: string | null = null;
    let isValidToken = false;

    if (token) {
      try {
        // التحقق من صلاحية التوكن أولاً
        const isValid = await this.userRepository.validateToken(token);

        if (isValid) {
          userId = (await this.userRepository.extractUserIdFromToken(token)) as
            | string
            | null;

          if (userId) {
            userProfileId = (await this.userRepository.getProfileIdByUserId(
              userId,
            )) as string | null;
            isValidToken = !!userProfileId; // توكن صالح فقط إذا وجدنا ملف تعريف المستخدم
          }
        }
      } catch (error) {
        console.error('Error validating token or extracting user info:', error);
        // في حالة الخطأ، نتابع بدون بيانات المستخدم
        userId = null;
        userProfileId = null;
        isValidToken = false;
      }
    }

    // بناء كائن where للفلترة
    let whereCondition: any = {
      status: PostStatus.PUBLISHED,
    };

    if (categoryId) {
      whereCondition.category = {
        id: categoryId,
      };
    }

    if (tagId) {
      whereCondition.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    // تحديد الحقول المضمنة في الاستعلام
    const postInclude = {
      category: { select: { name: true, id: true } },

      user: {
        select: {
          profileId: true,
          username: true,
          name: true,
          image: true,
          id: true,
        },
      },
      _count: {
        select: {
          comments: true,
          likes: true,
        },
      },
      ...(isValidToken
        ? {
            likes: {
              select: {
                userId: true,
              },
            },
          }
        : {}),
      tags: {
        include: {
          tag: true,
        },
      },
    };

    // جلب البيانات
    const result = await this.prisma.post.findMany({
      take: limit,
      skip: skip,
      where: whereCondition,
      orderBy: [{ createdAt: sortByValue }, { id: sortByValue }],
      include: {
        ...postInclude,
        comments: {
          take: 1,
          include: {
            user: { select: { name: true, image: true, id: true } },
          },
          skip: 0,
          orderBy: [{ createdAt: 'desc' }, { id: sortByValue }],
        },
      },
    });

    // تحويل النتائج
    if (!isValidToken) {
      // مستخدم غير مسجل الدخول أو توكن غير صالح
      return result.map((post) => {
        const { _count, tags, ...postData } = post;

        return {
          ...postData,
          tags: tags.map((tag) => ({ id: tag.tag.id, name: tag.tag.name })),
          likeCount: _count.likes,
          commentCount: _count.comments,
          isLiked: false,
          isFollowing: false,
        };
      });
    } else {
      // مستخدم مسجل الدخول - يحتاج لمعالجة متزامنة للتحقق من المتابعة
      const postsWithFollowStatus = await Promise.all(
        result.map(async (post) => {
          const { _count, tags, ...postData } = post;
          const isLiked =
            postData.likes?.some((like) => like.userId === userId) || false;

          try {
            let sameUser = false;
            let followRelation: any = null;

            // جلب معرف الملف الشخصي لصاحب المنشور
            if (post.userId === userId) {
              sameUser = true;
            } else {
              const posterUserProfileId =
                await this.userRepository.getProfileIdByUserId(post.userId);

              if (posterUserProfileId && userProfileId) {
                // التحقق من وجود متابعة
                followRelation = await this.prisma.follow.findUnique({
                  where: {
                    followerId_followingId: {
                      followerId: userProfileId,
                      followingId: posterUserProfileId,
                    },
                  },
                });
              }
            }

            return {
              ...postData,
              tags: tags.map((tag) => ({
                id: tag.tag.id,
                name: tag.tag.name,
              })),
              likeCount: _count.likes,
              commentCount: _count.comments,
              isLiked: isLiked,
              isFollowing: sameUser ? false : !!followRelation,
            };
          } catch (error) {
            console.error(
              `Error processing follow status for post ${post.id}:`,
              error,
            );
            return {
              ...postData,
              tags: tags.map((tag) => ({
                id: tag.tag.id,
                name: tag.tag.name,
              })),
              likeCount: _count.likes,
              commentCount: _count.comments,
              isLiked: isLiked,
              isFollowing: false,
            };
          }
        }),
      );

      return postsWithFollowStatus;
    }
  }
  async getPost(postId: string, accessToken: string) {
    let userId: string | null = null;
    let userProfileId: string | null = null;
    let isValidToken = false;

    if (accessToken) {
      try {
        // التحقق من صلاحية التوكن أولاً
        const isValid = await this.userRepository.validateToken(accessToken);

        if (isValid) {
          userId = (await this.userRepository.extractUserIdFromToken(
            accessToken,
          )) as string | null;

          if (userId) {
            userProfileId = (await this.userRepository.getProfileIdByUserId(
              userId,
            )) as string | null;
            isValidToken = !!userProfileId; // توكن صالح فقط إذا وجدنا ملف تعريف المستخدم
          }
        }
      } catch (error) {
        console.error('Error validating token or extracting user info:', error);
        // في حالة الخطأ، نتابع بدون بيانات المستخدم
        userId = null;
        userProfileId = null;
        isValidToken = false;
      }
    }
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: {
        category: { select: { name: true, id: true } },
        user: {
          select: {
            name: true,
            image: true,
            id: true,
            profileId: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
        ...(userId
          ? {
              likes: {
                select: {
                  userId: true,
                },
              },
            }
          : {}),
      },
    });

    if (!post) {
      return new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }
    console.log();
    const { _count, ...postData } = post;
    const isLiked =
      post?.likes?.some((like) => like.userId === userId) || false;
    let sameUser = false;
    let followRelation: any = null;

    // جلب معرف الملف الشخصي لصاحب المنشور
    if (post.userId === userId) {
      sameUser = true;
    } else {
      const posterUserProfileId =
        await this.userRepository.getProfileIdByUserId(post.userId);

      if (posterUserProfileId && userProfileId) {
        // التحقق من وجود متابعة
        followRelation = await this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userProfileId,
              followingId: posterUserProfileId,
            },
          },
        });
      }
    }
    return {
      ...postData,
      isFollowing: sameUser ? false : !!followRelation,
      likeCount: _count.likes,
      commentCount: _count.comments,
      isLiked,
    };
  }
  async deletePost(postId: string, user: any) {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });
    if (post?.userId !== user.id) {
      return new HttpException(
        'You are not authorized to delete this post',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.prisma.post.delete({
      where: { id: postId },
    });
    const profileCacheKey = `profile:${user.id}`;
    const updatePostCountFromCache =
      await this.redisService.get(profileCacheKey);
    console.log(updatePostCountFromCache, 'postsCountadsawd');
    if (updatePostCountFromCache) {
      await this.redisService.del(profileCacheKey);
      await this.redisService.set(
        profileCacheKey,
        {
          ...updatePostCountFromCache,
          postsCount: updatePostCountFromCache.postsCount - 1,
        },
        CACHE_TTL.PROFILE,
      );
    }
    return new HttpException('Post deleted successfully', HttpStatus.OK);
  }
  async getAllTags(limit = 10, page = 1) {
    const cacheKey = `tags:limit=${limit}:page=${page}`;

    // محاولة استرجاع البيانات من التخزين المؤقت
    const cachedData = await this.redisService.get(cacheKey);

    if (cachedData) {
      // إذا وجدت البيانات في التخزين المؤقت، قم بإرجاعها مباشرة
      return cachedData;
    }

    // في حال عدم وجود البيانات في التخزين المؤقت، قم باسترجاعها من قاعدة البيانات
    const skip = (page - 1) * limit;
    const tags = await this.prisma.tag.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // تخزين البيانات في Redis لاستخدامها لاحقًا
    // يمكنك تحديد مدة صلاحية التخزين المؤقت حسب احتياجاتك (هنا 30 دقيقة)
    await this.redisService.set(cacheKey, tags, CACHE_TTL.GET_ALL_TAGS);

    return tags;
  }
  async getAllCategories(limit = 10, page = 1) {
    const cacheKey = `categories:limit=${limit}:page=${page}`;

    // محاولة استرجاع البيانات من التخزين المؤقت
    const cachedData = await this.redisService.get(cacheKey);

    if (cachedData) {
      // إذا وجدت البيانات في التخزين المؤقت، قم بإرجاعها مباشرة
      return cachedData;
    }

    // في حال عدم وجود البيانات في التخزين المؤقت، قم باسترجاعها من قاعدة البيانات
    const skip = (page - 1) * limit;
    const categories = await this.prisma.category.findMany({
      take: limit,
      skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // تخزين البيانات في Redis لاستخدامها لاحقًا
    // يمكنك تحديد مدة صلاحية التخزين المؤقت حسب احتياجاتك (هنا 30 دقيقة)
    await this.redisService.set(
      cacheKey,
      categories,
      CACHE_TTL.GET_ALL_CATEGORIES,
    );

    return categories;
  }

  async getUserPosts(
    targetUserId: string,
    limit: number,
    page: number,
    token?: any,
  ) {
    let userId: string | null = null;
    let isValidToken = false;
    if (token) {
      try {
        // التحقق من صلاحية التوكن أولاً
        const isValid = await this.userRepository.validateToken(token);

        if (isValid) {
          userId = (await this.userRepository.extractUserIdFromToken(token)) as
            | string
            | null;
        }
      } catch (error) {
        console.error('Error validating token or extracting user info:', error);
        // في حالة الخطأ، نتابع بدون بيانات المستخدم
        userId = null;
        isValidToken = false;
      }
    }
    if (!page || !limit) {
      return {
        posts: [],
        pagination: {
          page: 1,
          limit: limit || 3,
          totalPages: 1,
        },
      };
    }
    const skip = (page - 1) * limit;
    const posts = await this.prisma.post.findMany({
      where: {
        userId: targetUserId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        ...(userId && { likes: { where: { userId: userId } } }),
        category: true,
        tags: { include: { tag: true } },
      },
      take: limit,
      skip: skip,
    });
    const totalPosts = await this.prisma.post.count({
      where: { userId: targetUserId },
    });
    const totalPages = Math.ceil(totalPosts / limit);

    console.log(userId, 'token4');
    console.log(targetUserId, 'token3');
    console.log(totalPosts, 'token2');
    console.log(posts, 'token1');
    return {
      posts: posts.map((post) => {
        const isLiked =
          post.likes?.some((like) => like.userId === userId) || false;

        return {
          ...post,
          tags: post.tags.map((tag) => ({
            name: tag.tag.name,
            id: tag.tag.id,
          })),
          likeCount: post._count.likes,
          isLiked: isLiked,
          commentCount: post._count.comments,
        };
      }),
      pagination: {
        total: totalPosts,
        pages: totalPages,
        page: page,
        limit: limit,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
  async likePost(postId: string, user: any) {
    const redisKey = `like:${postId}:${user.id}`;
    const postExistsKey = `post:${postId}:exists`;

    try {
      // التحقق من وجود المنشور باستخدام Redis أولاً
      let postExists = await this.redisService.get(postExistsKey);

      if (postExists === null) {
        // إذا لم تكن المعلومات متوفرة في Redis، تحقق من قاعدة البيانات
        const post = await this.prisma.post.findUnique({
          where: { id: postId },
          select: { id: true },
        });

        if (!post) {
          throw new NotFoundException('Post not found');
        }

        // تخزين معلومات وجود المنشور في Redis
        await this.redisService.set(postExistsKey, 'true', CACHE_TTL.LIKE_POST); // 24 ساعة
      }

      // التحقق من حالة الإعجاب من Redis
      const likeStatus = await this.redisService.get(redisKey);
      let action;

      if (likeStatus === 'liked') {
        // المستخدم معجب بالفعل، قم بإلغاء الإعجاب
        await this.prisma.like
          .delete({
            where: {
              postId_userId: {
                postId: postId,
                userId: user.id,
              },
            },
          })
          .catch((err) => {
            // تعامل مع أخطاء عدم وجود الإعجاب في قاعدة البيانات
            console.log('Like not found in database but existed in Redis');
          });

        // حذف من Redis
        await this.redisService.del(redisKey);
        action = 'unliked';
      } else {
        // محاولة إنشاء إعجاب جديد
        try {
          await this.prisma.like.create({
            data: {
              postId: postId,
              userId: user.id,
            },
          });

          // تخزين في Redis
          await this.redisService.set(redisKey, 'liked', CACHE_TTL.LIKE_POST);
          action = 'liked';
        } catch (err) {
          // إذا كان الإعجاب موجودًا بالفعل (خطأ في قيد الفرادة)
          if (err.code === 'P2002') {
            // إلغاء الإعجاب لأنه موجود بالفعل
            await this.prisma.like.delete({
              where: {
                postId_userId: {
                  postId: postId,
                  userId: user.id,
                },
              },
            });
            action = 'unliked';
          } else {
            throw err;
          }
        }
      }

      return {
        status: HttpStatus.OK,
        message: `Post ${action} Successfully`,
        action: action,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to process like: ' + error.message,
      );
    }
  }

  async updatePost(postId: string, user: any, image: any, updatePostData: any) {
    try {
      const imageUrl = this.userRepository.getImageUrl(image);
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });
      const parsedTags =
        (updatePostData.tags && JSON.parse(updatePostData.tags)) || null;
      console.log(image, updatePostData);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      if (post.userId !== user.id) {
        throw new UnauthorizedException(
          'You are not authorized to update this post',
        );
      }
      const postStatus = this.postRepository.getPostStatus(
        updatePostData.status,
      );
      const updateData = {
        title: updatePostData.title || post.title,
        content: updatePostData.content || post.content,
        imageUrl: imageUrl || updatePostData.imageUrl || null,

        status: postStatus,
      };
      console.log(parsedTags, 'tags');
      await this.prisma.postTag.deleteMany({ where: { postId } });

      // إنشاء العلاقات الجديدة
      if (parsedTags && parsedTags.length > 0) {
        await this.prisma.postTag.createMany({
          data: parsedTags.map((tag) => ({
            postId,
            tagId: tag.id,
          })),
        });
      } else {
        await this.prisma.postTag.createMany({
          data: [],
        });
      }

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          ...updateData,
          category: updatePostData.categoryId
            ? { connect: { id: updatePostData.categoryId } }
            : { disconnect: true },
        },
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          tags: { include: { tag: { select: { id: true, name: true } } } },
        },
      });

      return {
        status: HttpStatus.OK,
        message: 'Post updated successfully',
        post: {
          ...updatedPost,
          tags: updatedPost.tags.map((tag) => tag.tag),
        },
      };
    } catch (e) {
      console.log(e);
      return new InternalServerErrorException(e.message);
    }
  }

  async createPost(user: any, image: any, createPostData: any) {
    try {
      const imageUrl = this.userRepository.getImageUrl(image);
      const postStatus = this.postRepository.getPostStatus(
        createPostData.status,
      );
      const parsedTags = createPostData.tags && JSON.parse(createPostData.tags);
      console.log(user.id, 'created');
      const post = await this.prisma.post.create({
        data: {
          title: createPostData.title,
          content: createPostData.content,
          imageUrl: imageUrl || '',
          status: postStatus,
          ...(createPostData.categoryId && {
            category: { connect: { id: createPostData.categoryId } },
          }),
          user: {
            connect: {
              id: user.id,
            },
          },
        },
        select: { id: true },
      });

      if (parsedTags && parsedTags.length > 0) {
        await this.prisma.postTag.createMany({
          data: parsedTags.map((tag) => ({
            postId: post.id,
            tagId: tag.id,
          })),
          skipDuplicates: true,
        });
      }
      const profileCacheKey = `profile:${user.id}`;
      const updatePostCountFromCache =
        await this.redisService.get(profileCacheKey);
      if (updatePostCountFromCache) {
        await this.redisService.del(profileCacheKey);
        await this.redisService.set(
          profileCacheKey,
          {
            ...updatePostCountFromCache,
            postsCount: updatePostCountFromCache.postsCount + 1,
          },
          CACHE_TTL.PROFILE,
        );
      }
      return new HttpException('Post created successfully', HttpStatus.CREATED);
    } catch (e) {
      console.log(e);
      return new InternalServerErrorException(e.message);
    }
  }
}
