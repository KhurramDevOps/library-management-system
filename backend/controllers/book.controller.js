const { validationResult } = require('express-validator');
const Book = require('../models/Book');
const IssueRecord = require('../models/IssueRecord');
const sendResponse = require('../utils/sendResponse');

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const escapeRegex = (value) => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const optionalString = (value) => {
  return value === '' ? undefined : value;
};

/**
 * Return paginated books with optional search and category filters.
 */
const getBooks = async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { author: { $regex: safeSearch, $options: 'i' } },
        { category: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    if (category) {
      filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' };
    }

    const [books, total] = await Promise.all([
      Book.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Book.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Books fetched successfully', {
      books,
      total,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return a single book by ID.
 */
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return sendResponse(res, 404, false, 'Book not found');
    }

    return sendResponse(res, 200, true, 'Book fetched successfully', book);
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new book and initialize available copies.
 */
const createBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', errors.array());
    }

    const book = await Book.create({
      title: req.body.title,
      author: req.body.author,
      isbn: optionalString(req.body.isbn),
      category: req.body.category,
      totalCopies: req.body.totalCopies || 1,
      availableCopies: req.body.totalCopies || 1,
      description: req.body.description,
      publishedYear: req.body.publishedYear,
    });

    return sendResponse(res, 201, true, 'Book created successfully', book);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update book details while keeping available copies managed by issue records.
 */
const updateBook = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', errors.array());
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      return sendResponse(res, 404, false, 'Book not found');
    }

    const allowedFields = ['title', 'author', 'isbn', 'category', 'description', 'publishedYear'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        book[field] = field === 'isbn' ? optionalString(req.body[field]) : req.body[field];
      }
    });

    if (req.body.totalCopies !== undefined) {
      const nextTotalCopies = Number(req.body.totalCopies);
      const copyDelta = nextTotalCopies - book.totalCopies;
      const nextAvailableCopies = book.availableCopies + copyDelta;

      if (nextAvailableCopies < 0) {
        return sendResponse(res, 400, false, 'Total copies cannot be less than currently issued copies');
      }

      book.totalCopies = nextTotalCopies;
      book.availableCopies = nextAvailableCopies;
    }

    await book.save();
    return sendResponse(res, 200, true, 'Book updated successfully', book);
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete a book if it has no active issue records.
 */
const deleteBook = async (req, res, next) => {
  try {
    const activeIssue = await IssueRecord.exists({
      book: req.params.id,
      status: { $in: ['issued', 'overdue'] },
    });

    if (activeIssue) {
      return sendResponse(res, 400, false, 'Cannot delete a book with active issues');
    }

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return sendResponse(res, 404, false, 'Book not found');
    }

    return sendResponse(res, 200, true, 'Book deleted successfully', book);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
