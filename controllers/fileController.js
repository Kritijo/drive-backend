const prisma = require("../config/prisma");
const supabase = require("../config/supabase");
const { upload } = require("../config/multer");

exports.listFiles = async (req, res) => {
  try {
    if (!req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
    console.error(err);
  }
};

exports.uploadFile = [
  upload.single("file"),

  async (req, res) => {
    try {
      if (!req.user.id) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized." });
      }
      const file = req.file;
      const folderIdParam = req.params.folderId;
      const folderId = folderIdParam ? parseInt(folderIdParam) : null;

      if (!file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded." });
      }

      const supabasePath = `user_${req.user.id}/${Date.now()}_${
        file.originalname
      }`;

      const { data, error } = await supabase.storage
        .from("files")
        .upload(supabasePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (error)
        return res
          .status(500)
          .json({ success: false, message: "Error uploading file." });

      await prisma.file.create({
        data: {
          name: file.originalname,
          size: file.size,
          url: supabasePath,
          userId: req.user.id,
          folderId: folderId,
        },
      });
      res
        .status(201)
        .json({ success: true, message: "File uploaded successfully." });
    } catch (err) {
      res.status(500).json({ success: false, message: "Server error." });
      console.error(err);
    }
  },
];

exports.deleteFile = async (req, res) => {
  try {
    if (!req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const fileid = parseInt(req.params.id);

    const fileRecord = await prisma.file.findUnique({
      where: {
        userId: req.user.id,
        id: fileid,
      },
      select: { url: true },
    });

    await prisma.file.delete({
      where: {
        userId: req.user.id,
        id: fileid,
      },
    });

    await supabase.storage.from("files").remove([fileRecord.url]);

    res
      .status(200)
      .json({ success: true, message: "File deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
    console.error(err);
  }
};

exports.getFile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id), userId: req.user.id },
    });

    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found." });
    }

    const { data, error } = await supabase.storage
      .from("files")
      .createSignedUrl(file.url, 60);

    if (error)
      return res
        .status(500)
        .json({ success: false, message: "Error generating signed URL." });

    res.status(200).json({ success: true, signedUrl: data.signedUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
    console.error(err);
  }
};
