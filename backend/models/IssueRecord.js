const mongoose = require('mongoose');

const issueRecordSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued',
  },
  fine: {
    type: Number,
    default: 0,
    min: 0,
  },
});

issueRecordSchema.pre('validate', function setDueDate() {
  if (!this.dueDate) {
    const issueDate = this.issueDate || new Date();
    this.dueDate = new Date(issueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
  }
});

issueRecordSchema.pre('save', function calculateFine() {
  if (this.returnDate && this.dueDate && this.returnDate > this.dueDate) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const overdueDays = Math.ceil((this.returnDate - this.dueDate) / msPerDay);
    this.fine = overdueDays * 5;
  }
});

module.exports = mongoose.model('IssueRecord', issueRecordSchema);
