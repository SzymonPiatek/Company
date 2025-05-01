import { Router } from "express";
import getResourceLocationsHandler from "../../models/resourceLocation/handlers/getResourceLocations.handler";
import getResourceLocationByIdHandler from "../../models/resourceLocation/handlers/getResourceLocationById.handler";
import createResourceLocationHandler from "../../models/resourceLocation/handlers/createResourceLocation.handler";
import updateResourceLocationHandler from "../../models/resourceLocation/handlers/updateResourceLocation.handler";

const router = Router();

router.get("/", getResourceLocationsHandler);
router.get("/:id", getResourceLocationByIdHandler);

router.post("/", createResourceLocationHandler);

router.patch("/:id", updateResourceLocationHandler);

export default router;
