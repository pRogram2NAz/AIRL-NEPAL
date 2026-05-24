const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },   // HTML content
    image:   { type: String, default: '' },   // relative path or URL
    author:  { type: String, default: 'AIRL Nepal' },
    tags:    { type: [String], default: [] },
    date:    { type: Date, default: Date.now },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Article', ArticleSchema);
