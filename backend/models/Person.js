const mongoose = require('mongoose');

const PersonSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    role:    { type: String, required: true, trim: true },
    bio:     { type: String, default: '' },
    image:   { type: String, default: '' },   // relative path or URL
    email:   { type: String, default: '' },
    linkedin:{ type: String, default: '' },
    order:   { type: Number, default: 0 },    // display order on the team page
    active:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Person', PersonSchema);
