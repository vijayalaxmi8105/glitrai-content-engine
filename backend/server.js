require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const { generateImagePrompt } = require('./services/groqService');
const { generateImageUrl } = require('./services/imageService');

const app = express();

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Create Image Generation Job
app.post('/generate', async (req, res) => {
  const {
    productName,
    description,
    productImageUrl,
  } = req.body;

  if (!productName || !description) {
    return res.status(400).json({
      error: 'productName and description are required',
    });
  }

  let jobId;

  try {
    // 1. Insert pending job
    const insertResult = await pool.query(
      `
      INSERT INTO jobs (
        product_name,
        description,
        product_image_url,
        status
      )
      VALUES ($1, $2, $3, 'pending')
      RETURNING id
      `,
      [
        productName,
        description,
        productImageUrl || null,
      ]
    );

    jobId = insertResult.rows[0].id;

    // Return immediately
    res.status(202).json({
      jobId,
      status: 'pending',
    });

    // 2. Mark processing
    await pool.query(
      `
      UPDATE jobs
      SET status='processing',
          updated_at=NOW()
      WHERE id=$1
      `,
      [jobId]
    );

    // 3. Generate prompt
    const prompt = await generateImagePrompt(
      productName,
      description
    );

    // 4. Generate image URL
    const imageUrl = generateImageUrl(prompt);

    // 5. Save result
    await pool.query(
      `
      UPDATE jobs
      SET
        status='completed',
        prompt=$1,
        result_url=$2,
        updated_at=NOW()
      WHERE id=$3
      `,
      [
        prompt,
        imageUrl,
        jobId,
      ]
    );

    console.log(`✅ Job ${jobId} completed`);
  } catch (err) {
    console.error('❌ Job failed:', err);

    if (jobId) {
      try {
        await pool.query(
          `
          UPDATE jobs
          SET
            status='failed',
            error_message=$1,
            updated_at=NOW()
          WHERE id=$2
          `,
          [
            err.message,
            jobId,
          ]
        );
      } catch (dbErr) {
        console.error('Failed to update failed status:', dbErr);
      }
    }
  }
});

// Get Single Job
app.get('/jobs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT * FROM jobs WHERE id=$1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Job not found',
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

// Get All Jobs
app.get('/jobs', async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT *
      FROM jobs
      ORDER BY created_at DESC
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: 'Internal server error',
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});