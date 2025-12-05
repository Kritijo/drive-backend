require("dotenv").config();
const cors = require("cors");

const express = require("express");
const app = express();
const auth = require("./routes/authRoute");
const oauth = require("./routes/oAuthRoute");

const session = require("./config/session.js");
app.use(session);

const passport = require("passport");
const initializePassport = require("./config/passport");
initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api/v1/auth", auth);
app.use("/api/v1/oauth", oauth);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Express server running at http://localhost:${PORT}`)
);
