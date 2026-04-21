import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.static("public"));

// 🔁 Ambil semua block (recursive)
async function getBlocks(blockId) {
  const response = await fetch(
    `https://api.notion.com/v1/blocks/${blockId}/children`,
    {
      headers: {
        "Authorization": `Bearer ${process.env.NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28"
      }
    }
  );

  const data = await response.json();

  for (let block of data.results) {
    if (block.has_children) {
      block.children = await getBlocks(block.id);
    }
  }

  return data.results;
}

// API endpoint
app.get("/api/notion", async (req, res) => {
  try {
    const blocks = await getBlocks(process.env.PAGE_ID);
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: "Gagal ambil data" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 http://localhost:${process.env.PORT}`);
});