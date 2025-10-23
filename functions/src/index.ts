import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import multer from "multer";
import * as admin from "firebase-admin";

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

const storage = multer.memoryStorage();
const upload = multer({ storage });

app.post("/uploadProfilePic", upload.single("file"), async (req, res) => {
  try {
    if (!req.file || !req.body.uid) {
      return res.status(400).json({ error: "File and UID are required" });
    }

    const bucket = admin.storage().bucket();
    const fileName = `profile_pics/${req.body.uid}_${Date.now()}.jpg`;
    const file = bucket.file(fileName);

    await file.save(req.file.buffer, {
      metadata: { contentType: req.file.mimetype },
    });

    const [url] = await file.getSignedUrl({
      action: "read",
      expires: "03-09-2491",
    });

    return res.status(200).json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export const api = functions.https.onRequest(app);
