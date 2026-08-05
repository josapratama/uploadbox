import { Pool } from "pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { config } from "../config";

async function seed() {
  const pool = new Pool({ connectionString: config.databaseUrl });

  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("admin123", 12);

  // Create default admin user
  const userResult = await pool.query(
    `
    INSERT INTO users (email, password_hash, name)
    VALUES ('admin@uploadbox.local', $1, 'Admin')
    ON CONFLICT (email) DO UPDATE SET name = 'Admin'
    RETURNING id
  `,
    [passwordHash],
  );

  const userId = userResult.rows[0].id;

  // Create default project
  const projectResult = await pool.query(
    `
    INSERT INTO projects (name, description, user_id)
    VALUES ('Default Project', 'Default project for testing', $1)
    RETURNING id
  `,
    [userId],
  );

  const projectId = projectResult.rows[0].id;

  // Create API keys
  const publicKey = "pub_" + crypto.randomBytes(16).toString("hex");
  const secretKey = "sec_" + crypto.randomBytes(24).toString("hex");

  await pool.query(
    `
    INSERT INTO api_keys (project_id, public_key, secret_key, name)
    VALUES ($1, $2, $3, 'Default Key')
  `,
    [projectId, publicKey, secretKey],
  );

  console.log("Seed completed!");
  console.log("---");
  console.log("Admin credentials:");
  console.log("  Email: admin@uploadbox.local");
  console.log("  Password: admin123");
  console.log("---");
  console.log("API Keys:");
  console.log(`  Public Key: ${publicKey}`);
  console.log(`  Secret Key: ${secretKey}`);
  console.log("---");

  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
