import { Router } from "express";
import axios from 'axios';

const router = Router();

router.post("/execute", async (req, res) => {
  try {
    const { language_id, source_code, stdin } = req.body;

    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      {
        language_id,
        source_code,
        stdin,
      },
      {
        headers: {
          "content-type": "application/json",
          "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
          "X-RapidAPI-Host": process.env.JUDGE0_API_HOST,
        },
        params: { base64_encoded: "false", wait: "true" },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Execution failed" });
  }
});


export default router;