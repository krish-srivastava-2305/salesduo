import { optimizeListing } from "../services/ai.service.js";
import { getAmazonProductDetails } from "../services/scrapper.service.js";
import Report from "../models/report.model.js";
const scrapeAndAnalyze = async (req, res) => {
    try {
        const { asin } = req.body;
        const exists = await Report.findOne({ where: { asin: asin } });
        if (exists) {
            return res.status(200).json({
                optimizedListing: JSON.parse(exists.analyzedData),
                originalListing: JSON.parse(exists.originalDocument)
            });
        }

        const productDetails = await getAmazonProductDetails(asin);
        if (productDetails.error) {
            return res.status(500).json({ error: productDetails.error });
        }
        const optimizedListing = await optimizeListing(productDetails);

        await Report.create({
            asin: asin,
            originalDocument: JSON.stringify(productDetails) || "{}",
            analyzedData: JSON.stringify(optimizedListing) || "{}",
            created_at: new Date()
        });
        
        res.status(200).json({ optimizedListing, originalListing: productDetails });
    } catch (error) {
        console.error("Error in scrapeAndAnalyze:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

const getReports = async (req, res) => {
    const allReports = await Report.findAll();
    if (allReports.length > 0) {
        const formattedReports = allReports.map(report => ({
            asin: report.asin,
            originalDocument: JSON.parse(report.originalDocument),
            analyzedData: JSON.parse(report.analyzedData),
            createdAt: report.createdAt
        }));
        return res.status(200).json({ reports: formattedReports });
    }
    res.status(200).json({ reports: [] });
}

const updateListing = async (req, res) => {
    try {
        const { asin, updatedData } = req.body;

        const report = await Report.findOne({ where: { asin: asin } });
        if (!report) {
            return res.status(404).json({ error: "Report not found." });
        }
        report.analyzedData = JSON.stringify(updatedData);
        await report.save();

        res.status(200).json({ message: "Listing updated successfully." });
    } catch (error) {
        console.error("Error in updateListing:", error);
        res.status(500).json({ error: "Internal server error." });
    }
}

export { scrapeAndAnalyze, getReports, updateListing };