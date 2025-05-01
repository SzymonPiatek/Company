import type { RequestHandler } from "express";
import prisma from "../../../prismaClient";

type ResourceLocationBodyProps = {
  name: string;
  description?: string;
};

const createResourceLocationHandler: RequestHandler = async (req, res) => {
  try {
    const data = req.body as ResourceLocationBodyProps;

    const existing = await prisma.resourceLocation.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      res
        .status(409)
        .json({ error: "Resource location with this name already exists." });
      return;
    }

    const created = await prisma.resourceLocation.create({
      data,
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export default createResourceLocationHandler;
