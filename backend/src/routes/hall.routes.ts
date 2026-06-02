import { Router } from 'express';
import { 
  createHall, getHalls, getHallById, 
  updateHall, deleteHall, approveHall 
} from '../controllers/hall.controller';
import { auth, adminOnly, ownerOrAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getHalls);
router.get('/:id', getHallById);
router.post('/', auth, ownerOrAdmin, createHall);
router.put('/:id', auth, ownerOrAdmin, updateHall);
router.delete('/:id', auth, adminOnly, deleteHall);
router.patch('/:id/approve', auth, adminOnly, approveHall);

export default router;
