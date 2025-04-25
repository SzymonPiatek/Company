import type { RequestHandler } from "express";
import prisma from "../../../prismaClient";

type ResourceParamsProps = {
  id: string;
};

const getResourceByIdHandler: RequestHandler = async (
  req,
  res,
): Promise<void> => {
  const { id } = req.params as ResourceParamsProps;

  try {
    const results = await prisma.resource.findUnique({
      where: { id },
      include: { type: true },
    });

    if (!results) {
      res.status(404).json({ error: "Resource not found" });
      return;
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export default getResourceByIdHandler;
