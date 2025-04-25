import { Router } from "express";
import loginHandler from "./handlers/login.handler";

const router = Router();

router.post("/login", loginHandler);

export default router;
