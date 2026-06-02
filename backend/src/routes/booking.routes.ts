import { Router } from 'express';
import { createBooking, getBookings, cancelBooking, approveBooking, rejectBooking, updateBooking } from '../controllers/booking.controller';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/', auth, createBooking);
router.get('/', auth, getBookings);
router.put('/:id', auth, updateBooking);
router.patch('/:id/cancel', auth, cancelBooking);
router.patch('/:id/approve', auth, approveBooking);
router.patch('/:id/reject', auth, rejectBooking);

export default router;
