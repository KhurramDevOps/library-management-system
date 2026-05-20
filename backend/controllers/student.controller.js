const { validationResult } = require('express-validator');
const Student = require('../models/Student');
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
 * Return paginated students with optional name or roll number search.
 */
const getStudents = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = {};

    if (req.query.search) {
      const safeSearch = escapeRegex(req.query.search);
      filter.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { rollNumber: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const [students, total] = await Promise.all([
      Student.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Student.countDocuments(filter),
    ]);

    return sendResponse(res, 200, true, 'Students fetched successfully', {
      students,
      total,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Return a student and their currently active issue records.
 */
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return sendResponse(res, 404, false, 'Student not found');
    }

    const activeIssues = await IssueRecord.find({
      student: student._id,
      status: { $in: ['issued', 'overdue'] },
    }).populate('book', 'title author isbn category');

    return sendResponse(res, 200, true, 'Student fetched successfully', {
      student,
      activeIssues,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * Create a new student.
 */
const createStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', errors.array());
    }

    const student = await Student.create({
      name: req.body.name,
      rollNumber: req.body.rollNumber,
      email: optionalString(req.body.email),
      phone: req.body.phone,
      department: req.body.department,
    });

    return sendResponse(res, 201, true, 'Student created successfully', student);
  } catch (error) {
    return next(error);
  }
};

/**
 * Update a student by ID.
 */
const updateStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendResponse(res, 400, false, 'Validation failed', errors.array());
    }

    const updates = {};
    ['name', 'rollNumber', 'email', 'phone', 'department', 'isActive'].forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = field === 'email' ? optionalString(req.body[field]) : req.body[field];
      }
    });

    const student = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!student) {
      return sendResponse(res, 404, false, 'Student not found');
    }

    return sendResponse(res, 200, true, 'Student updated successfully', student);
  } catch (error) {
    return next(error);
  }
};

/**
 * Delete a student if they have no active issue records.
 */
const deleteStudent = async (req, res, next) => {
  try {
    const activeIssue = await IssueRecord.exists({
      student: req.params.id,
      status: { $in: ['issued', 'overdue'] },
    });

    if (activeIssue) {
      return sendResponse(res, 400, false, 'Cannot delete a student with active issued books');
    }

    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return sendResponse(res, 404, false, 'Student not found');
    }

    return sendResponse(res, 200, true, 'Student deleted successfully', student);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
