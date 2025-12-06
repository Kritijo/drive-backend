const fileController = require("../controllers/fileController");
const { Router } = require("express");
const fileRouter = Router();

fileRouter.post("/", fileController.uploadFile);
fileRouter.post("/folder/:folderId", fileController.uploadFile);
fileRouter.delete("/:id", fileController.deleteFile);

fileRouter.get("/:id", fileController.getFile);
fileRouter.get("/:id/download", fileController.getFile);

module.exports = fileRouter;
