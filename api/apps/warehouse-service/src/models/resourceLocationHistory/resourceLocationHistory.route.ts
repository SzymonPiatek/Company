import { Router } from "express";
import getResourceLocationHistoriesHandler from "../../models/resourceLocationHistory/handlers/getResourceLocationHistories.handler";
import getResourceLocationHistoryByIdHandler from "../../models/resourceLocationHistory/handlers/getResourceLocationHistoryById.handler";

const router = Router();

router.get("/", getResourceLocationHistoriesHandler);
router.get("/:id", getResourceLocationHistoryByIdHandler);

export default router;
