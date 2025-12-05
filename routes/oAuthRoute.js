const { Router } = require("express");
const passport = require("passport");

const oauth = Router();

oauth.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

oauth.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-failed",
  }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL + "/");
  }
);

module.exports = oauth;
