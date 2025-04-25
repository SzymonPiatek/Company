import type { RequestHandler } from "express";
import type { User } from "@prisma/client";
import prisma from "../../../prismaClient";
import parsePaginationQuery from "@libs/helpers/parsePaginationQuery";
import paginateData from "@libs/helpers/paginateData";
import buildQueryConditions from "@libs/helpers/buildQueryConditions";
import buildOrderBy from "@libs/helpers/buildOrderBy";

type UsersQueryProps = {
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: string;
  search?: string;
};

const getUsersHandler: RequestHandler = async (req, res) => {
  try {
    const pagination = parsePaginationQuery(req);

    const orderBy = buildOrderBy<User>({
      sortBy: pagination.sortBy,
      sortOrder: pagination.sortOrder,
      allowedFields: [
        "id",
        "email",
        "firstName",
        "lastName",
        "isActive",
        "createdAt",
        "updatedAt",
      ],
    });

    const { email, firstName, lastName, isActive, search } =
      req.query as UsersQueryProps;

    const where = buildQueryConditions({
      fields: ["email", "firstName", "lastName"],
      filters: { email, firstName, lastName, isActive },
      search,
    });

    const result = await paginateData(
      prisma.user,
      {
        where,
        orderBy,
        omit: {
          password: true,
        },
      },
      pagination,
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error", details: error });
  }
};

export default getUsersHandler;
