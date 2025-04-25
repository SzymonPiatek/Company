import type { RequestHandler } from "express";
import prisma from "../../../prismaClient";

type ResourceBodyProps = {
  name: string;
  code: string;
};

const createResourceTypeHandler: RequestHandler = async (
  req,
  res,
): Promise<void> => {
  try {
    const { name, code } = req.body as ResourceBodyProps;

    const isNameExisting = await prisma.resourceType.findUnique({
      where: { name },
    });

    if (isNameExisting) {
      res.status(404).json({ error: "Resource name already exists" });
      return;
    }

    const isCodeExisting = await prisma.resourceType.findUnique({
      where: { code },
    });

    if (isCodeExisting) {
      res.status(404).json({ error: "Resource code already exists" });
      return;
    }

    const type = await prisma.resourceType.create({
      data: { name, code },
    });

    res.status(201).json(type);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export default createResourceTypeHandler;
