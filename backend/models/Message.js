const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true },
    subject:   { type: String, default: '' },
    message:   { type: String, required: true },
    position:  { type: String, default: '' },  // pre-filled from opportunities page
    read:      { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', MessageSchema);
