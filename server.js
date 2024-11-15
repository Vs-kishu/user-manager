const express = require("express");
const http = require("http");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const initSocket = require("./socket");
const bcrypt = require("bcryptjs");
var morgan = require("morgan");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");

const cors = require("cors");
const User = require("./models/user");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
initSocket(server);

app.use(express.json());

const corsOptions = {
  origin: ["https://user-management-7t5g.vercel.app", "http://localhost:5173"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsOptions));

app.use(morgan("dev"));



app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
