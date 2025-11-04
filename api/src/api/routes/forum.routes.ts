import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { forumController } from '@api/controllers/forum.controller';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryIdParam,
  validateCreateThread,
  validateListThreads,
  validateThreadIdParam,
  validateUpdateThreadPin,
  validateUpdateThreadLock,
  validateSetBestAnswer,
  validateVote,
  validateCreatePost,
  validatePostIdParam,
  validateUpdatePost,
} from '@api/validators/forum.validator';

const router = Router();

// All forum endpoints require authentication
router.use(verifyToken);

// ===== CATEGORIES =====

// List categories in a community
router.get(
  '/communities/:communityId/forum/categories',
  forumController.listCategories.bind(forumController)
);

// Create category
router.post(
  '/communities/:communityId/forum/categories',
  validateCreateCategory,
  forumController.createCategory.bind(forumController)
);

// Update category
router.put(
  '/communities/:communityId/forum/categories/:categoryId',
  validateUpdateCategory,
  forumController.updateCategory.bind(forumController)
);

// Delete category
router.delete(
  '/communities/:communityId/forum/categories/:categoryId',
  validateCategoryIdParam,
  forumController.deleteCategory.bind(forumController)
);

// ===== THREADS =====

// List threads in a category
router.get(
  '/communities/:communityId/forum/categories/:categoryId/threads',
  validateListThreads,
  forumController.listThreads.bind(forumController)
);

// Create thread
router.post(
  '/communities/:communityId/forum/categories/:categoryId/threads',
  validateCreateThread,
  forumController.createThread.bind(forumController)
);

// Get thread with posts
router.get(
  '/communities/:communityId/forum/threads/:threadId',
  validateThreadIdParam,
  forumController.getThread.bind(forumController)
);

// Delete thread
router.delete(
  '/communities/:communityId/forum/threads/:threadId',
  validateThreadIdParam,
  forumController.deleteThread.bind(forumController)
);

// Pin/unpin thread
router.put(
  '/communities/:communityId/forum/threads/:threadId/pin',
  validateUpdateThreadPin,
  forumController.pinThread.bind(forumController)
);

// Lock/unlock thread
router.put(
  '/communities/:communityId/forum/threads/:threadId/lock',
  validateUpdateThreadLock,
  forumController.lockThread.bind(forumController)
);

// Set best answer
router.put(
  '/communities/:communityId/forum/threads/:threadId/best-answer',
  validateSetBestAnswer,
  forumController.setBestAnswer.bind(forumController)
);

// Vote on thread
router.post(
  '/communities/:communityId/forum/threads/:threadId/vote',
  validateThreadIdParam,
  validateVote,
  forumController.voteOnThread.bind(forumController)
);

// ===== POSTS =====

// Create post (reply to thread)
router.post(
  '/communities/:communityId/forum/threads/:threadId/posts',
  validateCreatePost,
  forumController.createPost.bind(forumController)
);

// Update post
router.put(
  '/communities/:communityId/forum/posts/:postId',
  validateUpdatePost,
  forumController.updatePost.bind(forumController)
);

// Delete post
router.delete(
  '/communities/:communityId/forum/posts/:postId',
  validatePostIdParam,
  forumController.deletePost.bind(forumController)
);

// Vote on post
router.post(
  '/communities/:communityId/forum/posts/:postId/vote',
  validatePostIdParam,
  validateVote,
  forumController.voteOnPost.bind(forumController)
);

export default router;
