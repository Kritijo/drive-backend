const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require("bcryptjs");
const prisma = require("./prisma");

function initialize(passport) {
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            return done(null, false, {
              message: "Incorrect email",
            });
          }
          const match = await bcrypt.compare(password, user.password);
          if (!match) {
            return done(null, false, {
              message: "Incorrect password",
            });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const name = profile.displayName;
          const provider = "google";
          const providerId = profile.id;

          const user = await prisma.user.upsert({
            where: { email },
            update: {
              accounts: {
                connectOrCreate: {
                  where: {
                    provider_providerAccountId: {
                      provider,
                      providerAccountId: providerId,
                    },
                  },
                  create: {
                    provider,
                    providerAccountId: providerId,
                  },
                },
              },
            },
            create: {
              name,
              email,
              password: null,
              accounts: {
                create: {
                  provider,
                  providerAccountId: providerId,
                },
              },
            },
            include: { accounts: true },
          });

          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

module.exports = initialize;
