const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    totalCopies: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    availableCopies: {
      type: Number,
      required: true,
      default() {
        return this.totalCopies || 1;
      },
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    publishedYear: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
