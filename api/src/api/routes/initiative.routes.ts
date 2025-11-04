import { Router } from 'express';
import { initiativeController } from '../controllers/initiative.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Initiative management
router.post(
  '/:communityId/councils/:councilId/initiatives',
  initiativeController.create.bind(initiativeController)
);
router.get(
  '/:communityId/councils/:councilId/initiatives',
  initiativeController.list.bind(initiativeController)
);
router.get(
  '/:communityId/initiatives/:initiativeId',
  initiativeController.getById.bind(initiativeController)
);
router.put(
  '/:communityId/initiatives/:initiativeId',
  initiativeController.update.bind(initiativeController)
);
router.delete(
  '/:communityId/initiatives/:initiativeId',
  initiativeController.delete.bind(initiativeController)
);

// Voting
router.post(
  '/:communityId/initiatives/:initiativeId/vote',
  initiativeController.vote.bind(initiativeController)
);
router.delete(
  '/:communityId/initiatives/:initiativeId/vote',
  initiativeController.removeVote.bind(initiativeController)
);

// Reports
router.post(
  '/:communityId/initiatives/:initiativeId/reports',
  initiativeController.createReport.bind(initiativeController)
);
router.get(
  '/:communityId/initiatives/:initiativeId/reports',
  initiativeController.listReports.bind(initiativeController)
);

// Initiative comments
router.post(
  '/:communityId/initiatives/:initiativeId/comments',
  initiativeController.createComment.bind(initiativeController)
);
router.get(
  '/:communityId/initiatives/:initiativeId/comments',
  initiativeController.listComments.bind(initiativeController)
);

// Report comments
router.post(
  '/:communityId/reports/:reportId/comments',
  initiativeController.createReportComment.bind(initiativeController)
);
router.get(
  '/:communityId/reports/:reportId/comments',
  initiativeController.listReportComments.bind(initiativeController)
);

export default router;
