const fileController = require("../controllers/fileController");
const { Router } = require("express");
const fileRouter = Router();

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

fileRouter.get("/", fileController.listFiles);
fileRouter.post("/", fileController.uploadFile);

fileRouter.post("/folder/:folderId", fileController.uploadFile);

fileRouter.get("/:id", fileController.viewFile);

fileRouter.get("/:id/download", fileController.downloadFile);

fileRouter.delete("/:id", fileController.deleteFile);

module.exports = fileRouter;
