const express = require('express');
const { body } = require('express-validator');
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/book.controller');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post(
  '/',
  protect,
  adminOnly,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('author').trim().notEmpty().withMessage('Author is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('totalCopies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1'),
    body('publishedYear').optional().isInt().withMessage('Published year must be a number'),
  ],
  createBook
);
router.put(
  '/:id',
  protect,
  adminOnly,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('author').optional().trim().notEmpty().withMessage('Author cannot be empty'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('totalCopies').optional().isInt({ min: 1 }).withMessage('Total copies must be at least 1'),
    body('availableCopies').not().exists().withMessage('Available copies cannot be updated directly'),
    body('publishedYear').optional().isInt().withMessage('Published year must be a number'),
  ],
  updateBook
);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
