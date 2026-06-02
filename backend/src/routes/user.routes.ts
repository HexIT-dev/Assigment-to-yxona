import { Router } from 'express';
import { getUsers, getUserById, updateProfile, deleteUser, createOwnerByAdmin } from '../controllers/user.controller';
import { auth, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.get('/', auth, adminOnly, getUsers);
router.post('/create-owner', auth, adminOnly, createOwnerByAdmin);
router.get('/:id', auth, getUserById);
router.put('/profile', auth, updateProfile);
router.delete('/:id', auth, adminOnly, deleteUser);

export default router;
