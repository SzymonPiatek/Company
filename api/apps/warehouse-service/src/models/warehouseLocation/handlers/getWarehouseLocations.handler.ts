import type { RequestHandler } from "express";
import type { WarehouseLocation } from "@prisma/client";
import parsePaginationQuery from "@libs/helpers/parsePaginationQuery";
import buildQueryConditions from "@libs/helpers/buildQueryConditions";
import paginateData from "@libs/helpers/paginateData";
import prisma from "../../../prismaClient";
import buildOrderBy from "@libs/helpers/buildOrderBy";

type WarehouseLocationQueryProps = {
  name?: string;
  description?: string;
  search?: string;
};

const getWarehouseLocationsHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<WarehouseLocation>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: ["id", "name", "description", "createdAt", "updatedAt"],
    });

    const { name, description, search } =
      req.query as WarehouseLocationQueryProps;

    const where = buildQueryConditions({
      fields: ["name", "description"],
      filters: { name, description },
      search,
    });

    const result = await paginateData(
      prisma.warehouseLocation,
      { where, orderBy },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export default getWarehouseLocationsHandler;
