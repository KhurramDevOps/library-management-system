const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const Student = require('../models/Student');
const IssueRecord = require('../models/IssueRecord');
const sendResponse = require('../utils/sendResponse');

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

/**
 * Issue a book to an active student after enforcing availability and student limits.
 */
const issueBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', errors.array());
    }

    const { bookId, studentId } = req.body;
    const [book, student] = await Promise.all([
      Book.findById(bookId),
      Student.findById(studentId),
    ]);

    if (!book || book.availableCopies < 1) {
      return sendResponse(res, 400, false, book ? 'No copies available' : 'Book not found');
    }

    if (!student || !student.isActive) {
      return sendResponse(res, 400, false, 'Student is not active or does not exist');
    }

    const duplicateIssue = await IssueRecord.exists({
      book: bookId,
      student: studentId,
      status: { $in: ['issued', 'overdue'] },
    });

    if (duplicateIssue) {
      return sendResponse(res, 400, false, 'Student already has this book issued');
    }

    const activeIssueCount = await IssueRecord.countDocuments({
      student: studentId,
      status: { $in: ['issued', 'overdue'] },
    });

    if (activeIssueCount >= 3) {
      return sendResponse(res, 400, false, 'Student has reached the issue limit of 3 books');
    }

    const issue = await IssueRecord.create({
      book: bookId,
      student: studentId,
      issuedBy: req.user.id,
    });

    book.availableCopies -= 1;
    await book.save();

    const populatedIssue = await IssueRecord.findById(issue._id)
      .populate('book', 'title author isbn category')
      .populate('student', 'name rollNumber')
      .populate('issuedBy', 'name email role');

    return sendResponse(res, 201, true, 'Book issued successfully', populatedIssue);
  } catch (error) {
    return next(error);
  }
};

/**
 * Return an issued book and calculate late fine if applicable.
 */
const returnBook = async (req, res, next) => {
  try {
    const issue = await IssueRecord.findById(req.params.issueId);
    if (!issue) {
      return sendResponse(res, 404, false, 'Issue record not found');
    }

    if (issue.status === 'returned') {
      return sendResponse(res, 400, false, 'Book is already returned');
    }

    issue.returnDate = new Date();
    issue.status = 'returned';
    await issue.save();

    await Book.findByIdAndUpdate(issue.book, { $inc: { availableCopies: 1 } });

    const populatedIssue = await IssueRecord.findById(issue._id)
      .populate('book', 'title author isbn category')
      .populate('student', 'name rollNumber')
      .populate('issuedBy', 'name email role');

    return sendResponse(res, 200, true, 'Book returned successfully', populatedIssue);
  } catch (error) {
    return next(error);
  }
};

/**
 * Return paginated issue records with optional status, student, and book filters.
 */
const getIssues = async (req, res, next) => {
  try {
    const { status, studentId, bookId } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (studentId) {
      filter.student = studentId;
    }

    if (bookId) {
      filter.book = bookId;
    }

    const [issues, total] = await Promise.all([
      IssueRecord.find(filter)
        .populate('book', 'title author')
        .populate('student', 'name rollNumber')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(limit),
      IssueRecord.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Issues fetched successfully', {
      issues,
      total,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return all issue history for one student.
 */
const getStudentIssues = async (req, res, next) => {
  try {
    const issues = await IssueRecord.find({ student: req.params.studentId })
      .populate('book', 'title author isbn category')
      .populate('student', 'name rollNumber')
      .populate('issuedBy', 'name email role')
      .sort({ issueDate: -1 });

    return sendResponse(res, 200, true, 'Student issue history fetched successfully', { issues });
  } catch (error) {
    return next(error);
  }
};

/**
 * Mark overdue issued records and return the overdue list.
 */
const getOverdueIssues = async (req, res, next) => {
  try {
    const today = new Date();

    await IssueRecord.updateMany(
      { status: 'issued', dueDate: { $lt: today } },
      { $set: { status: 'overdue' } }
    );

    const issues = await IssueRecord.find({
      status: 'overdue',
      returnDate: null,
    })
      .populate('book', 'title author')
      .populate('student', 'name rollNumber')
      .sort({ dueDate: 1 });

    return sendResponse(res, 200, true, 'Overdue issues fetched successfully', { issues });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  issueBook,
  returnBook,
  getIssues,
  getStudentIssues,
  getOverdueIssues,
};
