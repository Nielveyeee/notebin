// netlify/functions/notes.js
const { Client } = require("pg");

exports.handler = async (event, context) => {
  // Connect to your Neon database using the environment variable
  const client = new Client({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    if (event.httpMethod === "POST") {
      // Insert a new note
      const { name, to_whom, message } = JSON.parse(event.body);

      const result = await client.query(
        "INSERT INTO notes (name, to_whom, message) VALUES ($1, $2, $3) RETURNING *",
        [name, to_whom, message]
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.rows[0]),
      };
    }

    if (event.httpMethod === "GET") {
      // Fetch all notes
      const result = await client.query(
        "SELECT * FROM notes ORDER BY created_at DESC"
      );

      return {
        statusCode: 200,
        body: JSON.stringify(result.rows),
      };
    }

    return { statusCode: 400, body: "Invalid request" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: "Server error" };
  } finally {
    await client.end();
  }
};