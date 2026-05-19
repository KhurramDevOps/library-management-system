const express = require('express');
const { body } = require('express-validator');
const {
  issueBook,
  returnBook,
  getIssues,
  getStudentIssues,
  getOverdueIssues,
} = require('../controllers/issue.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post(
  '/issue',
  [
    body('bookId').isMongoId().withMessage('Valid bookId is required'),
    body('studentId').isMongoId().withMessage('Valid studentId is required'),
  ],
  issueBook
);
router.post('/return/:issueId', returnBook);
router.get('/overdue', getOverdueIssues);
router.get('/student/:studentId', getStudentIssues);
router.get('/', getIssues);

module.exports = router;
