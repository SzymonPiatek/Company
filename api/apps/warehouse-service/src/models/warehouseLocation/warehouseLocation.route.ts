import { Router } from "express";
import getWarehouseLocationsHandler from "../../models/warehouseLocation/handlers/getWarehouseLocations.handler";
import getWarehouseLocationByIdHandler from "../../models/warehouseLocation/handlers/getWarehouseLocationById.handler";
import createWarehouseLocationHandler from "../../models/warehouseLocation/handlers/createWarehouseLocation.handler";
import updateWarehouseLocationHandler from "../../models/warehouseLocation/handlers/updateWarehouseLocation.handler";

const router = Router();

router.get("/", getWarehouseLocationsHandler);
router.get("/:id", getWarehouseLocationByIdHandler);

router.post("/", createWarehouseLocationHandler);

router.patch("/:id", updateWarehouseLocationHandler);

export default router;
