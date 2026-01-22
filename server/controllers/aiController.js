import Groq from "groq-sdk";
import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";
import { v2 as cloudinary } from "cloudinary";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ================= ARTICLE ================= */
export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue" });
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("ARTICLE ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= BLOG TITLE ================= */
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    if (plan !== "premium" && free_usage >= 10) {
      return res.json({ success: false, message: "Limit reached. Upgrade to continue" });
    }

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: free_usage + 1 },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.log("BLOG TITLE ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= IMAGE GENERATION ================= */
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, publish } = req.body;

    if (req.plan !== "premium") {
      return res.json({ success: false, message: "Premium Feature Only" });
    }

    const formData = new FormData();
    formData.append("prompt", prompt);

    const clipdropRes = await axios.post(
      "https://clipdrop-api.co/text-to-image/v1",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "x-api-key": process.env.CLIPDROP_API_KEY,
        },
        responseType: "arraybuffer",
      }
    );

    const base64Image = `data:image/png;base64,${Buffer.from(clipdropRes.data).toString("base64")}`;

    const { secure_url } = await cloudinary.uploader.upload(base64Image);

    await sql`
      INSERT INTO creations (user_id, prompt, content, type, publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("IMAGE ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= REMOVE BACKGROUND ================= */
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();

    if (req.plan !== "premium") {
      return res.json({ success: false, message: "Premium Feature Only" });
    }

    const { secure_url } = await cloudinary.uploader.upload(req.file.path, {
      transformation: [{ effect: "background_removal" }],
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove Background', ${secure_url}, 'image')
    `;

    res.json({ success: true, content: secure_url });
  } catch (error) {
    console.log("BG REMOVE ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= REMOVE OBJECT ================= */
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { object } = req.body;

    if (req.plan !== "premium") {
      return res.json({ success: false, message: "Premium Feature Only" });
    }

    const { public_id } = await cloudinary.uploader.upload(req.file.path);

    const imageUrl = cloudinary.url(public_id, {
      transformation: [{ effect: `gen_remove:${object}` }],
      resource_type: "image",
    });

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${`Remove ${object}`}, ${imageUrl}, 'image')
    `;

    res.json({ success: true, content: imageUrl });
  } catch (error) {
    console.log("REMOVE OBJECT ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};

/* ================= RESUME REVIEW ================= */
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();

    if (req.plan !== "premium") {
      return res.json({ success: false, message: "Premium Feature Only" });
    }

    const resume = req.file;

    if (resume.size > 5 * 1024 * 1024) {
      return res.json({ success: false, message: "Max 5MB allowed." });
    }

    const buffer = fs.readFileSync(resume.path);
    const pdfData = await pdfParse(buffer);

    const prompt = `Review this resume and provide improvements:\n\n${pdfData.text}`;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Resume Review', ${content}, 'resume-review')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.log("RESUME ERROR:", error);
    res.json({ success: false, message: error.message });
  }
};
