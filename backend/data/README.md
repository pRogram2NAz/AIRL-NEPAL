# backend/data/

This folder holds the JSON database files when DB_MODE=json (default).

Files created automatically when seed.js is run:
- people.json
- articles.json
- messages.json
- projects.json

To seed from the existing frontend JSON files, run:
  node seed.js

Consider adding this folder to .gitignore if data is sensitive.
