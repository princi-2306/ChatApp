import express from 'express';
import 'dotenv/config'
import cors from 'cors' // if the whiteListing is required from backend to deliver the data to forntend
import cookieParser from "cookie-parser"
// routes imports
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import productLaptopRouter from "./routes/productLaptop.routes.js"
import productPartRouter from "./routes/productPart.routes.js"
import productDevicesRouter from "./routes/productDevices.routes.js"
import productPrinterCCTVRouter from "./routes/productPrintersCCTV.routes.js"
import serviceRouter from "./routes/service.routes.js"
import cartRouter from "./routes/cart.routes.js"
import orderRouter from "./routes/order.routes.js"

const app = express();

// middlewares
app.use(express.json());       // accepting this size of amount of json data here
app.use(express.urlencoded({
    extended:true,
    limit: "16kb"
}));
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // if cors is requested for backend to deliver the data



// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin",adminRouter)
app.use("/api/v1/productLaptops", productLaptopRouter)
app.use("/api/v1/productPart", productPartRouter)
app.use("/api/v1/productDevice", productDevicesRouter)
app.use("/api/v1/productPrinterCCTV", productPrinterCCTVRouter)
app.use("/api/v1/service", serviceRouter)
app.use("/api/v1/cart", cartRouter)
app.use("/api/v1/order", orderRouter)

app.get("/", (req, res) => res.send(`Server running on port`));

export default app;