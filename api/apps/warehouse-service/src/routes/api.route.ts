import { Router } from "express";
import healthRoute from "./health.route";
import warehouseLocationRoute from "../models/warehouseLocation/warehouseLocation.route";
import resourceLocationHistoryRoute from "../models/resourceLocationHistory/resourceLocationHistory.route";

const router = Router();

router.use("/health", healthRoute);

router.use("/warehouseLocations", warehouseLocationRoute);
router.use("/resourceLocationHistories/", resourceLocationHistoryRoute);

export default router;
