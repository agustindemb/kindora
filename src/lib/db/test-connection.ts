import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

async function test() {
  const connectionString = process.env.DATABASE_URL;
  console.log("Testing connection string (censored password):", connectionString?.replace(/:([^:@]+)@/, ":****@"));
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Supabase usually requires SSL
  });

  try {
    await client.connect();
    console.log("🎉 Connection successful!");

    // Test query on "user" table
    console.log("Testing query on 'user' table...");
    const userQuery = await client.query('SELECT * FROM "user" LIMIT 1');
    console.log("User query result count:", userQuery.rowCount);
    if (userQuery.rowCount && userQuery.rowCount > 0) {
      const u = userQuery.rows[0];
      console.log("Sample user ID:", u.id);

      // Let's import auth and test getSession
      const { auth } = await import("../auth/auth");
      
      // Let's create a test session in DB
      const testToken = "test_token_" + Math.random().toString(36).substring(2, 9);
      const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour
      
      await client.query(`
        INSERT INTO "session" (id, token, "userId", "expiresAt", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, NOW(), NOW())
      `, [testToken, testToken, u.id, expiresAt]);
      
      console.log("Inserted test session in DB with token:", testToken);

      // Now call getSession
      console.log("Calling auth.api.getSession...");
      const headers = new Headers();
      headers.set("cookie", `better-auth.session_token=${testToken}`);
      
      try {
        const sessionResult = await auth.api.getSession({
          headers
        });
        console.log("Session validation result:", sessionResult);
      } catch (authErr: any) {
        console.error("❌ Better Auth validation failed!");
        console.error(authErr.message);
        console.error(authErr.stack);
      }

      // Cleanup
      await client.query('DELETE FROM "session" WHERE id = $1', [testToken]);
      console.log("Cleaned up test session.");
    }
    
    await client.end();
  } catch (err: any) {
    console.error("❌ Database query failed!");
    console.error(err.message);
    console.error(err.stack);
  }
}

test();
