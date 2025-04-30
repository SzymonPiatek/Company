import type { RequestHandler } from "express";
import prisma from "../../../prismaClient";

type AssignedResourceParamsProps = {
  id: string;
};

type AssignedResourceBodyProps = {
  locationId: string;
};

const updateAssignedResourceHandler: RequestHandler = async (req, res) => {
  const { id } = req.params as AssignedResourceParamsProps;
  const { locationId } = req.body as AssignedResourceBodyProps;

  if (!locationId) {
    res.status(400).json({ error: "Missing locationId in request body" });
    return;
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.assignedResource.findUnique({ where: { id } });

      if (!existing) {
        throw new Error("NOT_FOUND");
      }

      const updatedAssigned = await tx.assignedResource.update({
        where: { id },
        data: { locationId },
      });

      await tx.resourceLocationHistory.create({
        data: {
          resourceId: existing.resourceId,
          fromLocationId: existing.locationId,
          toLocationId: locationId,
        },
      });

      return updatedAssigned;
    });

    res.status(200).json(updated);
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      res.status(404).json({ error: "Assigned resource not found" });
    } else {
      res.status(500).json({ error: "Internal Server Error", details: error });
    }
  }
};

export default updateAssignedResourceHandler;
