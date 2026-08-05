# UploadBox - Self-hosted File Upload & Delivery Platform

A self-hosted file upload, storage, processing, and CDN-like delivery platform inspired by Uploadcare.

## Features

- **File Upload** — Direct upload, multipart upload, upload from URL
- **File Storage** — Local disk storage with metadata in PostgreSQL
- **CDN-like Delivery** — Serve files via unique UUID URLs
- **Image Processing** — On-the-fly resize, crop, format conversion, filters
- **Video Processing** — Thumbnail generation, basic transcoding
- **File Management** — List, search, delete, metadata, grouping
- **API Key Authentication** — Project-based access control
- **Dashboard** — Vue 3 frontend for file management
- **Docker** — Full Docker Compose setup for easy deployment

## Tech Stack

- **Backend**: Fastify + TypeScript
- **Database**: PostgreSQL
- **Storage**: Local disk (extensible to S3)
- **Frontend**: Vue 3 + Vite + TypeScript
- **Image Processing**: Sharp
- **Video Processing**: FFmpeg
- **Containerization**: Docker + Docker Compose

## Quick Start

```bash
# Clone and start with Docker
docker-compose up -d

# Or run locally
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

## API Endpoints

### Upload API

- `POST /api/upload/file` — Direct file upload
- `POST /api/upload/multipart/start` — Start multipart upload
- `POST /api/upload/multipart/chunk` — Upload chunk
- `POST /api/upload/multipart/complete` — Complete multipart upload
- `POST /api/upload/from-url` — Upload from external URL

### File Management API

- `GET /api/files` — List files (with pagination, filtering)
- `GET /api/files/:uuid` — Get file info
- `DELETE /api/files/:uuid` — Delete file
- `PUT /api/files/:uuid/metadata` — Update file metadata
- `POST /api/files/batch-delete` — Batch delete files

### File Groups API

- `POST /api/groups` — Create file group
- `GET /api/groups` — List groups
- `GET /api/groups/:uuid` — Get group info
- `DELETE /api/groups/:uuid` — Delete group

### CDN / Delivery API

- `GET /cdn/:uuid/:filename` — Serve original file
- `GET /cdn/:uuid/-/resize/:dimensions/:filename` — Resize on-the-fly
- `GET /cdn/:uuid/-/crop/:dimensions/:filename` — Crop on-the-fly
- `GET /cdn/:uuid/-/format/:format/:filename` — Convert format
- `GET /cdn/:uuid/-/quality/:level/:filename` — Adjust quality
- `GET /cdn/:uuid/-/preview/` — Quick preview (thumbnail)

### Project / Auth API

- `POST /api/projects` — Create project
- `GET /api/projects` — List projects
- `POST /api/projects/:id/keys` — Generate API key
- `DELETE /api/projects/:id/keys/:keyId` — Revoke API key

## Environment Variables

| Variable        | Default                                                     | Description                 |
| --------------- | ----------------------------------------------------------- | --------------------------- |
| `DATABASE_URL`  | `postgresql://uploadbox:uploadbox@localhost:5432/uploadbox` | PostgreSQL connection       |
| `STORAGE_PATH`  | `./storage`                                                 | Local file storage path     |
| `PORT`          | `3000`                                                      | Backend server port         |
| `FRONTEND_URL`  | `http://localhost:5173`                                     | Frontend URL for CORS       |
| `JWT_SECRET`    | `change-me-in-production`                                   | JWT signing secret          |
| `MAX_FILE_SIZE` | `5368709120`                                                | Max file size (5GB default) |

## License

MIT
