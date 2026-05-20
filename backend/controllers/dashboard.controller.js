const Book = require('../models/Book');
const Student = require('../models/Student');
const IssueRecord = require('../models/IssueRecord');
const sendResponse = require('../utils/sendResponse');

/**
 * Return aggregate dashboard stats and the five most recent issue records.
 */
const getStats = async (req, res, next) => {
  try {
    const today = new Date();

    await IssueRecord.updateMany(
      { status: 'issued', dueDate: { $lt: today } },
      { $set: { status: 'overdue' } }
    );

    const [
      totalBooks,
      totalStudents,
      totalIssued,
      totalOverdue,
      totalReturned,
      recentIssues,
    ] = await Promise.all([
      Book.countDocuments(),
      Student.countDocuments(),
      IssueRecord.countDocuments({ status: 'issued' }),
      IssueRecord.countDocuments({ status: 'overdue' }),
      IssueRecord.countDocuments({ status: 'returned' }),
      IssueRecord.find()
        .populate('book', 'title author')
        .populate('student', 'name rollNumber')
        .sort({ issueDate: -1 })
        .limit(5),
    ]);

    return sendResponse(res, 200, true, 'Dashboard stats fetched successfully', {
      totalBooks,
      totalStudents,
      totalIssued,
      totalOverdue,
      totalReturned,
      recentIssues,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStats,
};
