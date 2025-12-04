const { Router } = require("express");
const authRouter = Router();

const auth = require("../controllers/authController");
const signUpValidation = require("../config/signUpValidation");

authRouter.post("/signup", signUpValidation, auth.signUp);
authRouter.post("/login", auth.logIn);
authRouter.post("/logout", auth.logOut);
authRouter.get("/user", auth.user);

module.exports = authRouter;
