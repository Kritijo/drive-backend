const { Router } = require("express");
const folderRouter = Router();

const folderController = require("../controllers/folderController");

folderRouter.get("/", folderController.listItems);
folderRouter.get("/:folderId", folderController.listItems);

folderRouter.post("/", folderController.uploadFolder);
folderRouter.post("/:folderId", folderController.uploadFolder);
folderRouter.delete("/:folderId", folderController.deleteFolder);
folderRouter.put("/:folderId", folderController.editFolder);

module.exports = folderRouter;
