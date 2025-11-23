import { Router } from 'express';
import multer from 'multer';
import { councilController } from '../controllers/council.controller';
import { verifyToken } from '../middleware/auth.middleware';
import { councilsController } from '../controllers/councils.controller';
import { validateGetManagedCouncils } from '../validators/councils.validator';
import { poolsController } from '../controllers/pools.controller';
import { validateGetCouncilPools } from '../validators/pools.validator';
import { initiativeController } from '../controllers/initiative.controller';
import { councilUsageReportController } from '../controllers/councilUsageReport.controller';
import {
  validateCreateUsageReport,
  validateGetUsageReport,
  validateListUsageReports,
  validateUpdateUsageReport,
  validateDeleteUsageReport,
  validateAddAttachment,
  validateRemoveAttachment,
} from '../validators/councilUsageReport.validator';
import { poolConsumptionController } from '../controllers/poolConsumption.controller';
import {
  validateCreateConsumption,
  validateListConsumptions,
  validateGetConsumption,
  validateUpdateConsumption,
  validateLinkToReport,
  validateDeleteConsumption,
} from '../validators/poolConsumption.validator';

// Multer configuration for attachment uploads
const attachmentUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (_req, file, cb) => {
    // Allow images and common document types
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  },
});

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Council management
router.get('/:communityId/councils', councilController.list.bind(councilController));
router.get('/:communityId/councils/managed', validateGetManagedCouncils, councilsController.getManagedCouncils.bind(councilsController));
router.get('/:communityId/councils/:councilId', councilController.getById.bind(councilController));
router.post('/:communityId/councils', councilController.create.bind(councilController));
router.put('/:communityId/councils/:councilId', councilController.update.bind(councilController));
router.delete('/:communityId/councils/:councilId', councilController.delete.bind(councilController));

// Council trust
router.post('/:communityId/councils/:councilId/trust', councilController.awardTrust.bind(councilController));
router.delete('/:communityId/councils/:councilId/trust', councilController.removeTrust.bind(councilController));
router.get('/:communityId/councils/:councilId/trust-status', councilController.getTrustStatus.bind(councilController));

// Council managers
router.post('/:communityId/councils/:councilId/managers', councilController.addManager.bind(councilController));
router.delete('/:communityId/councils/:councilId/managers/:userId', councilController.removeManager.bind(councilController));

// Council pools
router.get('/:communityId/councils/:councilId/pools', validateGetCouncilPools, poolsController.getCouncilPools.bind(poolsController));

// Initiative management (nested under council)
router.get('/:communityId/councils/:councilId/initiatives', initiativeController.list.bind(initiativeController));
router.post('/:communityId/councils/:councilId/initiatives', initiativeController.create.bind(initiativeController));
router.get('/:communityId/councils/:councilId/initiatives/:initiativeId', initiativeController.getById.bind(initiativeController));
router.put('/:communityId/councils/:councilId/initiatives/:initiativeId', initiativeController.update.bind(initiativeController));
router.delete('/:communityId/councils/:councilId/initiatives/:initiativeId', initiativeController.delete.bind(initiativeController));

// Initiative voting
router.post('/:communityId/councils/:councilId/initiatives/:initiativeId/vote', initiativeController.vote.bind(initiativeController));
router.delete('/:communityId/councils/:councilId/initiatives/:initiativeId/vote', initiativeController.removeVote.bind(initiativeController));

// Initiative comments
router.get('/:communityId/councils/:councilId/initiatives/:initiativeId/comments', initiativeController.listComments.bind(initiativeController));
router.post('/:communityId/councils/:councilId/initiatives/:initiativeId/comments', initiativeController.createComment.bind(initiativeController));

// Initiative reports
router.get('/:communityId/councils/:councilId/initiatives/:initiativeId/reports', initiativeController.listReports.bind(initiativeController));
router.post('/:communityId/councils/:councilId/initiatives/:initiativeId/reports', initiativeController.createReport.bind(initiativeController));
router.get('/:communityId/councils/:councilId/initiatives/:initiativeId/reports/:reportId/comments', initiativeController.listReportComments.bind(initiativeController));
router.post('/:communityId/councils/:councilId/initiatives/:initiativeId/reports/:reportId/comments', initiativeController.createReportComment.bind(initiativeController));

// Council usage reports
router.get('/:communityId/councils/:councilId/usage-reports', validateListUsageReports, councilUsageReportController.list.bind(councilUsageReportController));
router.post('/:communityId/councils/:councilId/usage-reports', validateCreateUsageReport, councilUsageReportController.create.bind(councilUsageReportController));
router.get('/:communityId/councils/:councilId/usage-reports/:reportId', validateGetUsageReport, councilUsageReportController.getById.bind(councilUsageReportController));
router.patch('/:communityId/councils/:councilId/usage-reports/:reportId', validateUpdateUsageReport, councilUsageReportController.update.bind(councilUsageReportController));
router.delete('/:communityId/councils/:councilId/usage-reports/:reportId', validateDeleteUsageReport, councilUsageReportController.delete.bind(councilUsageReportController));

// Council usage report attachments
router.post(
  '/:communityId/councils/:councilId/usage-reports/:reportId/attachments',
  attachmentUpload.single('file'),
  validateAddAttachment,
  councilUsageReportController.addAttachment.bind(councilUsageReportController)
);
router.delete(
  '/:communityId/councils/:councilId/usage-reports/:reportId/attachments/:attachmentId',
  validateRemoveAttachment,
  councilUsageReportController.removeAttachment.bind(councilUsageReportController)
);

// Pool consumptions
router.get('/:communityId/councils/:councilId/consumptions', validateListConsumptions, poolConsumptionController.list.bind(poolConsumptionController));
router.get('/:communityId/councils/:councilId/consumptions/unreported', validateListConsumptions, poolConsumptionController.listUnreported.bind(poolConsumptionController));
router.post('/:communityId/councils/:councilId/consumptions', validateCreateConsumption, poolConsumptionController.create.bind(poolConsumptionController));
router.post('/:communityId/councils/:councilId/consumptions/link-to-report', validateLinkToReport, poolConsumptionController.linkToReport.bind(poolConsumptionController));
router.get('/:communityId/councils/:councilId/consumptions/:consumptionId', validateGetConsumption, poolConsumptionController.getById.bind(poolConsumptionController));
router.patch('/:communityId/councils/:councilId/consumptions/:consumptionId', validateUpdateConsumption, poolConsumptionController.update.bind(poolConsumptionController));
router.delete('/:communityId/councils/:councilId/consumptions/:consumptionId', validateDeleteConsumption, poolConsumptionController.delete.bind(poolConsumptionController));

export default router;
