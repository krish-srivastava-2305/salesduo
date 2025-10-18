import { Sequelize} from 'sequelize';
import { configDotenv } from 'dotenv';
configDotenv();

const sequalize = new Sequelize(process.env.DB_URI, {
    host: process.env.DB_HOST,
    dialect: "mysql"
})

export default sequalize;