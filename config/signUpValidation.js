const { body } = require("express-validator");
const prisma = require("./prisma");

const signUpValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid email.")
    .bail()
    .custom(async (email) => {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });
      if (user) {
        throw new Error("Email already in use");
      }
    }),
  body("password")
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 characters."),
];

module.exports = signUpValidation;
