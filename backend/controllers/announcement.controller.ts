import { Response } from "express";
import { prisma } from "../config/database";
import { AuthRequest } from "../middleware/auth.middleware";
import { AppError } from "../middleware/error.middleware";
import { announcementSchema } from "../utils/validators";
import { paramString } from "../utils/helpers";

export async function getAnnouncements(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const announcements = await prisma.announcement.findMany({
    where: { saccoId },
    orderBy: { createdAt: "desc" },
  });
  return res.json({ success: true, data: announcements });
}

export async function postAnnouncement(req: AuthRequest, res: Response) {
  const saccoId = req.user!.saccoId;
  if (!saccoId) throw new AppError("No SACCO assigned", 400);

  const data = announcementSchema.parse(req.body);
  const { author } = req.body;

  const announcement = await prisma.announcement.create({
    data: {
      saccoId,
      title: data.title,
      content: data.message,
      author: author ?? "Admin",
    },
  });
  return res.status(201).json({ success: true, data: announcement });
}

export async function deleteAnnouncement(req: AuthRequest, res: Response) {
  const id = paramString(req.params, "id");
  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw new AppError("Announcement not found", 404);

  await prisma.announcement.delete({ where: { id } });
  return res.json({ success: true, message: "Deleted" });
}
