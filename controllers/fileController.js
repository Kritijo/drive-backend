const prisma = require("../config/prisma");
const supabase = require("../config/supabase");
const { upload } = require("../config/multer");

exports.listFiles = async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: { userId: req.user.id },
    });
    res.status(200).json({ success: true, files });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.uploadFile = [
  upload.single("file"),

  async (req, res) => {
    try {
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
    }
  },
];

exports.viewFile = async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: parseInt(req.params.id), userId: req.user.id },
  });

  const { data, error } = await supabase.storage
    .from("files")
    .createSignedUrl(file.url, 60 * 5);

  if (error)
    return res
      .status(500)
      .json({ success: false, message: "Error generating signed URL." });

  res.status(200).json({ success: true, url: data.signedUrl });
};

exports.deleteFile = async (req, res) => {
  try {
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

    await supabase.storage.from("uploads").remove([fileRecord.url]);

    res
      .status(200)
      .json({ success: true, message: "File deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.downloadFile = async (req, res, next) => {
  const axios = require("axios");

  try {
    const file = await prisma.file.findUnique({
      where: { id: parseInt(req.params.id), userId: req.user.id },
    });
    if (!file) {
      const error = new Error("File not found.");
      error.status = 404;
      return next(error);
    }

    const { data, error } = await supabase.storage
      .from("uploads")
      .createSignedUrl(file.url, 60);

    if (error) return next(error);

    const fileStream = await axios({
      method: "GET",
      url: data.signedUrl,
      responseType: "stream",
    });

    res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);

    fileStream.data.pipe(res);
  } catch (err) {
    next(err);
  }
};
