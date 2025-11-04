import { Router } from 'express';
import { councilController } from '../controllers/council.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// Council management
router.get('/:communityId/councils', councilController.list.bind(councilController));
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

// Council inventory and transactions
router.get('/:communityId/councils/:councilId/inventory', councilController.getInventory.bind(councilController));
router.get('/:communityId/councils/:councilId/transactions', councilController.getTransactions.bind(councilController));

export default router;
