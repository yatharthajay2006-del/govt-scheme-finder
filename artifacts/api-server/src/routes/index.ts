import { Router, type IRouter } from "express";
import healthRouter from "./health";
import schemesRouter from "./schemes";
import eligibilityRouter from "./eligibility";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(schemesRouter);
router.use(eligibilityRouter);
router.use(statsRouter);

export default router;
