import { Router } from "express";
import getResourceTypesHandler from "./handlers/getResourceTypes.handler";
import getResourceTypeByIdHandler from "./handlers/getResourceTypeById.handler";
import createResourceTypeHandler from "./handlers/createResourceType.handler";
import editResourcesTypeHandler from "./handlers/updateResourceType.handler";

const router = Router();

router.get("/", getResourceTypesHandler);
router.get("/:id", getResourceTypeByIdHandler);

router.post("/", createResourceTypeHandler);

router.patch("/:id", editResourcesTypeHandler);

export default router;
