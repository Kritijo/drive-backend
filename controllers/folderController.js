const prisma = require("../config/prisma");

exports.listItems = async (req, res) => {
  try {
    const folderIdParam = req.params.folderId;
    const folderId = folderIdParam ? parseInt(folderIdParam) : null;
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const folders = await prisma.folder.findMany({
      where: { userId, parentId: folderId },
    });

    const files = await prisma.file.findMany({
      where: { userId, folderId: folderId },
    });

    res.json({ success: true, folders, files });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
    console.error(err);
  }
};

exports.uploadFolder = async (req, res) => {
  try {
    const folderIdParam = req.params.folderId;
    const folderId = folderIdParam ? parseInt(folderIdParam) : null;
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const folderName = req.body.foldername;

    const existingFolder = await prisma.folder.findFirst({
      where: {
        name: folderName,
        userId: userId,
        parentId: folderId,
      },
    });

    if (existingFolder) {
      return res
        .status(400)
        .json({ success: false, message: "Folder name already exists." });
    }

    await prisma.folder.create({
      data: {
        name: folderName,
        userId: userId,
        parentId: folderId,
      },
    });
    res
      .status(201)
      .json({ success: true, message: "Folder created successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
    console.error(err);
  }
};

exports.editFolder = async (req, res) => {
  try {
    const folderId = parseInt(req.params.folderId);
    const folderName = req.body.foldername;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await prisma.folder.update({
      where: {
        id: folderId,
      },
      data: {
        name: folderName,
      },
    });
    res.json({ success: true, message: "Folder renamed successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
    console.error(err);
  }
};

const getAllDescendantFolderIds = async (folderId) => {
  const results = await prisma.$queryRaw`
        WITH RECURSIVE subfolders AS (
            SELECT id FROM "Folder" WHERE id = ${folderId}
            UNION ALL
            SELECT f.id FROM "Folder" f
            INNER JOIN subfolders sf ON f."parentId" = sf.id
        )
        SELECT id FROM subfolders;
    `;

  return results.map((row) => row.id);
};

const deleteFilesInFolders = async (folderIds, userId) => {
  const supabase = require("../config/supabase");

  const files = await prisma.file.findMany({
    where: {
      folderId: { in: folderIds },
      userId: userId,
    },
    select: { url: true },
  });

  const pathsToDelete = files.map((file) => file.url).filter(Boolean);

  if (pathsToDelete.length > 0) {
    const { error } = await supabase.storage
      .from("uploads")
      .remove(pathsToDelete);

    if (error) {
      throw new Error("Failed to delete files from storage.");
    }
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folderId = parseInt(req.params.folderId);
    const userId = req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const folderIds = await getAllDescendantFolderIds(folderId);

    await deleteFilesInFolders(folderIds, userId);

    await prisma.folder.deleteMany({
      where: {
        id: { in: folderIds },
        userId: userId,
      },
    });
    res.json({ success: true, message: "Folder deleted successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
    console.error(err);
  }
};
