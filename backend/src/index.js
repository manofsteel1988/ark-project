require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { sessionMiddleware } = require("./middleware/session");
const { errorHandler } = require("./middleware/errorHandler");

const productsRoutes = require("./routes/products.routes");
const configuratorRoutes = require("./routes/configurator.routes");
const cartRoutes = require("./routes/cart.routes");
const favoritesRoutes = require("./routes/favorites.routes");
const packagingRoutes = require("./routes/packaging.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "*",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/products", productsRoutes);
app.use("/api/configurator", configuratorRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/packaging", packagingRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/account", accountRoutes);

app.use((req, res) => res.status(404).json({ error: { message: "Route introuvable", code: "NOT_FOUND" } }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ARK API en écoute sur http://localhost:${PORT}`);
});
