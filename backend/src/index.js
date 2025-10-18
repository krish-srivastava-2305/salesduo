import express, { urlencoded } from 'express';
import cors from "cors";
import dotenv from "dotenv"
import Report from './models/report.model.js';
import router from './router/router.js';
dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use('/api', router);

app.post('/health', async (req, res) => {
    res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 4000;

const startServer = async () => {
    try {
        console.log(process.env.DB_URI);
        await Report.sync({ alter: true });
        app.listen(PORT, () => console.log(`App running on http://localhost:${PORT}`));
    } catch (error) {
        console.error('Failed to start server: ', error && error.stack ? error.stack : error);
        process.exit(1);
    }
}

startServer()