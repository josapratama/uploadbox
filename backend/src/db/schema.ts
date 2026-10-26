import {
  pgTable,
  text,
  timestamp,
  integer,
  bigint,
  boolean,
  jsonb,
  uuid,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  storageQuota: bigint("storage_quota", { mode: "number" })
    .default(5368709120)
    .notNull(), // 5GB default
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const apiKeys = pgTable("api_keys", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  publicKey: varchar("public_key", { length: 64 }).notNull().unique(),
  secretKey: varchar("secret_key", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
});

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    originalFilename: varchar("original_filename", { length: 1024 }).notNull(),
    mimeType: varchar("mime_type", { length: 255 }).notNull(),
    size: bigint("size", { mode: "number" }).notNull(),
    storagePath: text("storage_path").notNull(),
    isImage: boolean("is_image").default(false).notNull(),
    isVideo: boolean("is_video").default(false).notNull(),
    width: integer("width"),
    height: integer("height"),
    duration: integer("duration"), // video duration in seconds
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    folder: varchar("folder", { length: 1024 }).default("/").notNull(),
    version: integer("version").default(1).notNull(),
    parentFileId: uuid("parent_file_id"),
    downloadCount: integer("download_count").default(0).notNull(),
    isStored: boolean("is_stored").default(true).notNull(),
    isDeleted: boolean("is_deleted").default(false).notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    projectIdIdx: index("files_project_id_idx").on(table.projectId),
    mimeTypeIdx: index("files_mime_type_idx").on(table.mimeType),
    uploadedAtIdx: index("files_uploaded_at_idx").on(table.uploadedAt),
    folderIdx: index("files_folder_idx").on(table.folder),
  }),
);

export const projectMembers = pgTable(
  "project_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 20 }).default("viewer").notNull(),
    invitedAt: timestamp("invited_at").defaultNow().notNull(),
  },
  (table) => ({
    projectUserIdx: index("project_members_project_user_idx").on(
      table.projectId,
      table.userId,
    ),
  }),
);

export const fileGroups = pgTable("file_groups", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fileGroupItems = pgTable("file_group_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  groupId: uuid("group_id")
    .notNull()
    .references(() => fileGroups.id, { onDelete: "cascade" }),
  fileId: uuid("file_id")
    .notNull()
    .references(() => files.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const multipartUploads = pgTable("multipart_uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  filename: varchar("filename", { length: 1024 }).notNull(),
  mimeType: varchar("mime_type", { length: 255 }).notNull(),
  totalSize: bigint("total_size", { mode: "number" }).notNull(),
  totalParts: integer("total_parts").notNull(),
  uploadedParts: integer("uploaded_parts").default(0).notNull(),
  storagePath: text("storage_path").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // pending, uploading, completed, failed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const webhooks = pgTable("webhooks", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  events: jsonb("events").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  secret: varchar("secret", { length: 64 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable(
  "activity_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    action: varchar("action", { length: 50 }).notNull(),
    fileId: uuid("file_id").references(() => files.id, {
      onDelete: "set null",
    }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: index("activity_logs_project_id_idx").on(table.projectId),
    createdAtIdx: index("activity_logs_created_at_idx").on(table.createdAt),
  }),
);

export const shareLinks = pgTable(
  "share_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileId: uuid("file_id")
      .notNull()
      .references(() => files.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 64 }).notNull().unique(),
    expiresAt: timestamp("expires_at"),
    maxDownloads: integer("max_downloads"),
    downloadCount: integer("download_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tokenIdx: index("share_links_token_idx").on(table.token),
  }),
);
