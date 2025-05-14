import { Router } from 'express';
import { getAllAdmins, getAdminById } from '../controllers/adminController.js';

const router = Router();

// Routes for admin management
router.get('/admins', getAllAdmins);
router.get('/getAdmin/:id', getAdminById);

export default router;
