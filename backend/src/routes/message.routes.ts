import { Router } from 'express';
import {
  sendMessage, getMessages, getConversations,
  getAvailableContacts, blockUser, unblockUser
} from '../controllers/message.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', auth, sendMessage);
router.get('/', auth, getMessages);
router.get('/conversations', auth, getConversations);
router.get('/contacts', auth, getAvailableContacts);
router.post('/block/:userId', auth, blockUser);
router.delete('/block/:userId', auth, unblockUser);

export default router;
