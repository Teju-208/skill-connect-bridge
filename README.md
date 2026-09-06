# Smart Skill Connect

AI-powered Academia–Industry Skill & Career Intelligence Platform.

## Run locally
```bash
npm install
npm start
```
Open http://localhost:3000

## Deploy
This version uses the portable `sql.js` SQLite engine instead of native `sqlite3`, so it avoids Linux GLIBC/native-module compatibility issues on free cloud hosts such as Render. The server also respects Render's `PORT` environment variable.

## AI features
- Resume PDF/TXT parsing
- NLP-style skill extraction and normalization
- AI career readiness / skill-gap analysis
- Personalized course recommendations
- Skill-based internship/job matching

The AI engine is a transparent local NLP/ranking prototype rather than a trained generative model.
