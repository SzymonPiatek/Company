import { Router } from "express";
import healthRoute from "./health.route";
import resourceLocationRoute from "../models/resourceLocation/resourceLocation.route";

const router = Router();

router.use("/health", healthRoute);
router.use("/resourceLocations", resourceLocationRoute);

export default router;
