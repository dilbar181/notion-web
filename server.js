import express from "express";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const app = express();
const __dirname = new URL('.', import.meta.url).pathname;

app.use(express.static("public"));

// 🔁 recursive fetch
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

// API
app.get("/api/notion", async (req, res) => {
  try {
    console.log("TOKEN:", process.env.NOTION_TOKEN);
    console.log("PAGE:", process.env.PAGE_ID);

    const blocks = await getBlocks(process.env.PAGE_ID);

    res.json(blocks);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ FIX PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di port ${PORT}`);
});