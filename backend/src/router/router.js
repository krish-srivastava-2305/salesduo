import { Router } from "express";
import { getReports, scrapeAndAnalyze, updateListing } from "../controllers/controllers.js";

const router = Router();

router.post("/scrape-analyzer", scrapeAndAnalyze)
router.get("/reports", getReports)
router.patch("/update-listing", updateListing)

export default router;