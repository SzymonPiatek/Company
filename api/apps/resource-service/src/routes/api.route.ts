import { Router } from "express";
import healthRoute from "./health.route";
import resourceRoute from "../models/resource/resource.route";
import resourceTypeRoute from "../models/resourceType/resourceType.route";

const router = Router();

router.use("/health", healthRoute);
router.use("/resourceTypes", resourceTypeRoute);
router.use("/resources", resourceRoute);

export default router;
