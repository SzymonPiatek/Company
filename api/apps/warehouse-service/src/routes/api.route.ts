import { Router } from "express";
import healthRoute from "./health.route";
import resourceLocationRoute from "../models/resourceLocation/resourceLocation.route";
import assignedResourceRoute from "../models/assignedResource/assignedResource.route";
import resourceLocationHistoryRoute from "../models/resourceLocationHistory/resourceLocationHistory.route";

const router = Router();

router.use("/health", healthRoute);
router.use("/resourceLocations", resourceLocationRoute);
router.use("/assignedResources", assignedResourceRoute);
router.use("/resourceLocationHistories", resourceLocationHistoryRoute);

export default router;
