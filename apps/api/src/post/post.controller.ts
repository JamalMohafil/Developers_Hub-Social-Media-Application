import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from 'src/auth/decoratores/public.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from 'src/user/user.repository';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UpdateReplyDto } from './dto/update-reply.dto';
import { PostService } from './services/post.service';
import { TagService } from './services/tag.service';
import { CategoryService } from './services/category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { SharpPipe } from 'src/common/pipes/share.pipe';
import { ReplyService } from './services/reply.service';
import { CommentService } from './services/comment.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly tagService: TagService,
    private readonly categoryService: CategoryService,
    private readonly prisma: PrismaService,
    private readonly userRepository: UserRepository,
    private readonly replyService: ReplyService,
    private readonly commentService: CommentService,
  ) {}

  @Public()
  @Get('/posts')
  getPosts(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('sortBy') sortBy: string,
    @Query('categoryId') categoryId: string,
    @Query('tagId') tagId: string,
    @Req() req,
  ) {
    const accessToken = this.userRepository.getAccessTokenFromHeaders(
      req.headers,
    );

    return this.postService.getPosts(
      limit,
      page,
      sortBy,
      categoryId,
      tagId,
      accessToken,
    );
  }

  @Public()
  @Get('/user/:userId')
  getUserPosts(
    @Param('userId') userId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Req() req,
  ) {
    const accessToken = this.userRepository.getAccessTokenFromHeaders(
      req.headers,
    );
    return this.postService.getUserPosts(userId, limit, page, accessToken);
  }

  @Public()
  @Get("/getPost/:postId")
  getPost(@Param('postId') postId: string, @Req() req) {
    const accessToken = this.userRepository.getAccessTokenFromHeaders(
      req.headers
    )
    return this.postService.getPost(postId,accessToken);
  }

  @Public()
  @Get('/selectTags')
  getTags(@Query('search') search: string) {
    return this.tagService.getTags(search);
  }

  @Public()
  @Get('/selectCategories')
  getCategories(@Query('search') search: string) {
    return this.categoryService.getCategories(search);
  }

  @Public()
  @Get('/tags')
  getAllTags(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.postService.getAllTags(limit, page);
  }
  @Public()
  @Get('/categories')
  getAllCategories(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    return this.postService.getAllCategories(limit, page);
  }

  @Public()
  @Get('/:postId/comments')
  getPostComments(
    @Param('postId') postId: string,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('sortBy') sortBy: string,
    @Req() req,
  ) {
    const accessToken = this.userRepository.getAccessTokenFromHeaders(
      req.headers,
    );
    return this.commentService.getPostComments(
      postId,
      limit,
      page,
      sortBy,
      accessToken,
    );
  }

  @Public()
  @Get('/:commentId/replies')
  getCommentReplies(
    @Param('commentId') commentId: string,
    @Req() req,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('page', ParseIntPipe) page: number,
  ) {
    const accessToken = this.userRepository.getAccessTokenFromHeaders(
      req.headers,
    );
    return this.replyService.getCommentReplies(
      commentId,
      limit,
      page,
      accessToken,
    );
  }

  @Post('')
  @UseInterceptors(FileInterceptor('image'))
  createPost(
    @UploadedFile(SharpPipe) image: Express.Multer.File | null,
    @Body() createPostData: any,
    @Req() req,
  ) {
    return this.postService.createPost(req.user, image, createPostData);
  }

  @Post('/like/:postId')
  likePost(@Param('postId') postId: string, @Req() req) {
    return this.postService.likePost(postId, req.user);
  }

  @Post('/:postId/comments')
  addComment(@Param('postId') postId: string, @Req() req, @Body() body: any) {
    return this.commentService.addComment(postId, req.user, body.content);
  }

  @Post(':postId/comments/:commentId/reply')
  addReply(
    @Param('commentId') commentId: string,
    @Param('postId') postId: string,
    @Req() req,
    @Body() body: any,
  ) {
    return this.replyService.addReply(
      commentId,
      postId,
      req.user,
      body.content,
    );
  }

  @Post('/like/comments/:commentId')
  likeComment(@Param('commentId') commentId: string, @Req() req) {
    return this.commentService.likeComment(commentId, req.user);
  }
  @Post('/like/replies/:replyId')
  likeReply(@Param('replyId') replyId: string, @Req() req) {
    return this.replyService.likeReply(replyId, req.user);
  }

  @Put('/:postId/comments/:commentId')
  updateComment(
    @Param('postId') postId: string,

    @Param('commentId') commentId: string,
    @Req() req,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    console.log(updateCommentDto, commentId);

    return this.commentService.updateComment(
      postId,
      commentId,

      updateCommentDto.content,
      req.user,
    );
  }

  @Put('/:postId/comments/:commentId/replies/:replyId')
  updateReply(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Param('replyId') replyId: string,
    @Req() req,
    @Body() updateReplyDto: UpdateReplyDto,
  ) {
    return this.replyService.updateReply(
      postId,
      replyId,
      updateReplyDto.content,
      req.user,
    );
  }

  @Put('/:postId')
  @UseInterceptors(
    FileInterceptor('image', { limits: { fileSize: Math.pow(1024, 2) * 5 } }),
  )
  updatePost(
    @Param('postId') postId: string,
    @Req() req,
    @UploadedFile(SharpPipe) image,
    @Body() updatePostData: any,
  ) {
    return this.postService.updatePost(postId, req.user, image, updatePostData);
  }

  @Delete('/:postId/comments/:commentId')
  deleteComment(
    @Param('commentId') commentId: string,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    return this.commentService.deleteComment(commentId, postId, req.user);
  }
  @Delete('/:postId/comments/:commentId/replies/:replyId')
  deleteReply(
    @Param('postId') postId: string,
    @Param('replyId') replyId: string,
    @Req() req,
  ) {
    return this.replyService.deleteReply(replyId, postId, req.user);
  }

  @Delete('/:postId')
  deletePost(@Param('postId') postId: string, @Req() req) {
    return this.postService.deletePost(postId, req.user);
  }
}
