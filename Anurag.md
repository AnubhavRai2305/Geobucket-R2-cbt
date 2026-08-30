# 30th August, 2026.
- Defined repository rules and planned about the communication strategy between backend and frontend.
- Designed polymorphic REST API endpoints (saved in `api.md`) and MongoDB schemas separating student test-takers from administrative staff (admin, teacher, counsellor roles).
- Created and launched the Express API server (in root `server/` directory) with Mongoose, incorporating standard `bcryptjs` password hashing and signed JWT authentication middleware.
- Built the React Admin Dashboard (in `admin/` directory) using state-based navigation routing, React.lazy code splitting, and a mature slate-pastel visual theme.
- Booted a local standalone MongoDB instance on port 27017 and verified all authentication API routes.