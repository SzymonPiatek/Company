import type { RequestHandler } from "express";
import prisma from "../../../prismaClient";
import axios from "axios";

type AssignedResourceBodyProps = {
  resourceId: string;
  locationId: string;
};

const createAssignedResourceHandler: RequestHandler = async (req, res) => {
  try {
    const data = req.body as AssignedResourceBodyProps;

    if (!data?.resourceId || !data?.locationId) {
      res.status(400).json({ error: "ResourceId and locationId are required" });
      return;
    }

    try {
      const resourceCheck = await axios.get(
        `${process.env.RESOURCE_SERVICE_URL}/resources/${data.resourceId}`,
      );

      if (!resourceCheck.data) {
        res.status(404).json({ error: "Resource not found" });
        return;
      }
    } catch (error) {
      res.status(404).json({ error: "Resource not found", details: error });
      return;
    }

    const assigned = await prisma.assignedResource.create({
      data,
    });

    res.status(201).json(assigned);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export default createAssignedResourceHandler;
