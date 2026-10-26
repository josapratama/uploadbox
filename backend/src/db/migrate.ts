import { Pool } from "pg";
import { config } from "../config";

export async function runMigrations() {
  const pool = new Pool({ connectionString: config.databaseUrl });

  console.log("Running migrations...");

  try {
    await pool.query(`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS api_keys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        public_key VARCHAR(64) NOT NULL UNIQUE,
        secret_key VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(255),
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        last_used_at TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS files (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        original_filename VARCHAR(1024) NOT NULL,
        mime_type VARCHAR(255) NOT NULL,
        size BIGINT NOT NULL,
        storage_path TEXT NOT NULL,
        is_image BOOLEAN DEFAULT FALSE NOT NULL,
        is_video BOOLEAN DEFAULT FALSE NOT NULL,
        width INTEGER,
        height INTEGER,
        duration INTEGER,
        metadata JSONB,
        is_stored BOOLEAN DEFAULT TRUE NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW() NOT NULL,
        deleted_at TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS files_project_id_idx ON files(project_id);
      CREATE INDEX IF NOT EXISTS files_mime_type_idx ON files(mime_type);
      CREATE INDEX IF NOT EXISTS files_uploaded_at_idx ON files(uploaded_at);

      CREATE TABLE IF NOT EXISTS file_groups (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS file_group_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        group_id UUID NOT NULL REFERENCES file_groups(id) ON DELETE CASCADE,
        file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        sort_order INTEGER DEFAULT 0 NOT NULL
      );

      CREATE TABLE IF NOT EXISTS multipart_uploads (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        filename VARCHAR(1024) NOT NULL,
        mime_type VARCHAR(255) NOT NULL,
        total_size BIGINT NOT NULL,
        total_parts INTEGER NOT NULL,
        uploaded_parts INTEGER DEFAULT 0 NOT NULL,
        storage_path TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        expires_at TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS webhooks (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        url TEXT NOT NULL,
        events JSONB NOT NULL,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        secret VARCHAR(64),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      ALTER TABLE projects ADD COLUMN IF NOT EXISTS storage_quota BIGINT DEFAULT 5368709120 NOT NULL;

      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        action VARCHAR(50) NOT NULL,
        file_id UUID REFERENCES files(id) ON DELETE SET NULL,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS activity_logs_project_id_idx ON activity_logs(project_id);
      CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at);

      CREATE TABLE IF NOT EXISTS share_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        token VARCHAR(64) NOT NULL UNIQUE,
        expires_at TIMESTAMP,
        max_downloads INTEGER,
        download_count INTEGER DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      );

      CREATE INDEX IF NOT EXISTS share_links_token_idx ON share_links(token);

      -- Folder support
      ALTER TABLE files ADD COLUMN IF NOT EXISTS folder VARCHAR(1024) DEFAULT '/' NOT NULL;
      CREATE INDEX IF NOT EXISTS files_folder_idx ON files(folder);

      -- File versioning
      ALTER TABLE files ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;
      ALTER TABLE files ADD COLUMN IF NOT EXISTS parent_file_id UUID REFERENCES files(id) ON DELETE SET NULL;

      -- Download tracking
      ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0 NOT NULL;

      -- Video flag fix
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'files' AND column_name = 'isvideo'
        ) THEN
          ALTER TABLE files RENAME COLUMN isvideo TO is_video;
        END IF;
      END $$;
      ALTER TABLE files ADD COLUMN IF NOT EXISTS is_video BOOLEAN DEFAULT FALSE NOT NULL;

      -- Team members / collaboration
      CREATE TABLE IF NOT EXISTS project_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'viewer' NOT NULL,
        invited_at TIMESTAMP DEFAULT NOW() NOT NULL,
        UNIQUE(project_id, user_id)
      );
    `);

    console.log("Migrations completed successfully!");
  } finally {
    await pool.end();
  }
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].includes("migrate")) {
  runMigrations().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
}
