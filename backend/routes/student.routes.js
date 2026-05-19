const express = require('express');
const { body } = require('express-validator');
const {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/student.controller');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('rollNumber').trim().notEmpty().withMessage('Roll number is required'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
  ],
  createStudent
);
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('rollNumber').optional().trim().notEmpty().withMessage('Roll number cannot be empty'),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required').normalizeEmail(),
  ],
  updateStudent
);
router.delete('/:id', adminOnly, deleteStudent);

module.exports = router;
