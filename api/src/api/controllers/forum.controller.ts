import { Request, Response, NextFunction } from 'express';
import { forumService } from '@services/forum.service';

class ForumController {
  // ===== CATEGORIES =====

  /**
   * @swagger
   * /api/communities/{communityId}/forum/categories:
   *   get:
   *     summary: List all forum categories in a community
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of forum categories
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async listCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = (req as any).user?.id;

      const categories = await forumService.listCategories(communityId, userId);

      return res.status(200).json({
        status: 'success',
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/categories:
   *   post:
   *     summary: Create a new forum category
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 example: "General Discussion"
   *               description:
   *                 type: string
   *                 example: "General community discussions"
   *     responses:
   *       201:
   *         description: Category created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = (req as any).user?.id;
      const { name, description } = req.body;

      const category = await forumService.createCategory(
        {
          communityId,
          name,
          description,
        },
        userId
      );

      return res.status(201).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/categories/{categoryId}:
   *   put:
   *     summary: Update a forum category
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const userId = (req as any).user?.id;

      const category = await forumService.updateCategory(categoryId, req.body, userId);

      return res.status(200).json({
        status: 'success',
        data: { category },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/categories/{categoryId}:
   *   delete:
   *     summary: Delete a forum category
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const userId = (req as any).user?.id;

      await forumService.deleteCategory(categoryId, userId);

      return res.status(200).json({
        status: 'success',
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== THREADS =====

  /**
   * @swagger
   * /api/communities/{communityId}/forum/categories/{categoryId}/threads:
   *   get:
   *     summary: List threads in a category
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async listThreads(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const userId = (req as any).user?.id;
      const { page, limit, sort } = req.query;

      const result = await forumService.listThreads(categoryId, userId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sort: sort as any,
      });

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/categories/{categoryId}/threads:
   *   post:
   *     summary: Create a new thread
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async createThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const userId = (req as any).user?.id;
      const { title, content, tags } = req.body;

      const thread = await forumService.createThread(
        {
          categoryId,
          title,
          content,
          authorId: userId,
          tags,
        },
        userId
      );

      return res.status(201).json({
        status: 'success',
        data: { thread },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/threads/{threadId}:
   *   get:
   *     summary: Get thread details with all posts
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async getThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user?.id;

      const result = await forumService.getThread(threadId, userId);

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/threads/{threadId}:
   *   delete:
   *     summary: Delete a thread
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async deleteThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user?.id;

      await forumService.deleteThread(threadId, userId);

      return res.status(200).json({
        status: 'success',
        message: 'Thread deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/threads/{threadId}/pin:
   *   put:
   *     summary: Pin or unpin a thread
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async pinThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user?.id;
      const { isPinned } = req.body;

      const thread = await forumService.pinThread(threadId, isPinned, userId);

      return res.status(200).json({
        status: 'success',
        data: { thread },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/threads/{threadId}/lock:
   *   put:
   *     summary: Lock or unlock a thread
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async lockThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user?.id;
      const { isLocked } = req.body;

      const thread = await forumService.lockThread(threadId, isLocked, userId);

      return res.status(200).json({
        status: 'success',
        data: { thread },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/threads/{threadId}/best-answer:
   *   put:
   *     summary: Mark a post as best answer
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async setBestAnswer(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user?.id;
      const { postId } = req.body;

      const thread = await forumService.setBestAnswer(threadId, postId, userId);

      return res.status(200).json({
        status: 'success',
        data: { thread },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/threads/{threadId}/vote:
   *   post:
   *     summary: Vote on a thread
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async voteOnThread(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user?.id;
      const { voteType } = req.body;

      const voteCounts = await forumService.voteOnThread(threadId, voteType, userId);

      return res.status(200).json({
        status: 'success',
        data: voteCounts,
      });
    } catch (error) {
      next(error);
    }
  }

  // ===== POSTS =====

  /**
   * @swagger
   * /api/communities/{communityId}/forum/threads/{threadId}/posts:
   *   post:
   *     summary: Create a new post (reply to thread)
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async createPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { threadId } = req.params;
      const userId = (req as any).user?.id;
      const { content } = req.body;

      const post = await forumService.createPost(
        {
          threadId,
          content,
          authorId: userId,
        },
        userId
      );

      return res.status(201).json({
        status: 'success',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/posts/{postId}:
   *   put:
   *     summary: Update a post
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async updatePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.id;
      const { content } = req.body;

      const post = await forumService.updatePost(postId, { content }, userId);

      return res.status(200).json({
        status: 'success',
        data: { post },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/posts/{postId}:
   *   delete:
   *     summary: Delete a post
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async deletePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.id;

      await forumService.deletePost(postId, userId);

      return res.status(200).json({
        status: 'success',
        message: 'Post deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/communities/{communityId}/forum/posts/{postId}/vote:
   *   post:
   *     summary: Vote on a post
   *     tags: [Forum]
   *     security:
   *       - bearerAuth: []
   */
  async voteOnPost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const userId = (req as any).user?.id;
      const { voteType } = req.body;

      const voteCounts = await forumService.voteOnPost(postId, voteType, userId);

      return res.status(200).json({
        status: 'success',
        data: voteCounts,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const forumController = new ForumController();
