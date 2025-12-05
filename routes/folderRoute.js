const { Router } = require("express");
const folderRouter = Router();

const folderController = require("../controllers/folderController");

folderRouter.get("/", folderController.listFolders);
folderRouter.post("/", folderController.uploadFolder);

// folderRouter.get("/folder/:folderId", folderController.viewFolder);

// folderRouter.post(
//     "/folder/:folderId/upload-folder",
//     folderController.uploadFolder
// );

// folderRouter.post("/delete-folder/:folderId", folderController.deleteFolder);

// folderRouter.get("/folder/:folderId/update", folderController.getEditFolder);
// folderRouter.post("/folder/:folderId/update", folderController.postEditFolder);

module.exports = folderRouter;
