import sequalize from "../config/db.config.js";
import { DataTypes } from "sequelize";

const Report = sequalize.define("Report", {
    asin: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    originalDocument : {
        type: DataTypes.TEXT,
        allowNull: false
    },
    analyzedData: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
})

export default Report;