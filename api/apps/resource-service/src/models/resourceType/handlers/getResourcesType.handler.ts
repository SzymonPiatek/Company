import type { RequestHandler } from "express";
import type { ResourceType } from "@prisma/client";
import prisma from "../../../prismaClient";
import paginateData from "@libs/helpers/paginateData";
import parsePaginationQuery from "@libs//helpers/parsePaginationQuery";
import buildQueryConditions from "@libs/helpers/buildQueryConditions";
import buildOrderBy from "@libs/helpers/buildOrderBy";

type ResourceTypeQueryProps = {
  name?: string;
  code?: string;
  search?: string;
};

const getResourceTypesHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<ResourceType>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ["id", "name", "code", "createdAt", "updatedAt"],
    });

    const { name, code, search } = req.query as ResourceTypeQueryProps;

    const where = buildQueryConditions({
      fields: ["name", "code"],
      filters: { name, code },
      search,
    });

    const result = await paginateData(
      prisma.resourceType,
      {
        where,
        orderBy,
        include: {
          resources: true,
        },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export default getResourceTypesHandler;
