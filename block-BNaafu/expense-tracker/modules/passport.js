var passport = require('passport');
var GitHubStrategy = require('passport-github').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var User = require('../model/User');

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/github/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      var profileData = {
        name: profile.displayName,
        username: profile.username,
      };
      User.findOne({ username: profile.username,name:profile.displayName }, (err, user) => {
        if (err) return done(err);
        if (!user) {
          User.create(profileData, (err, addedUser) => {
            if (err) return done(err);
            return done(null, addedUser);
          });
        } else {
          return done(null, user);
        }
      });
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:4000/auth/google/callback',
    },
    (accessToken, refreshToken, profile, done) => {
      var profileData = {
        name: profile._json.name,
        email: profile._json.email,
      };
      User.findOne(
        { email: profile._json.email, name: profile._json.name },
        (err, user) => {
          if (err) return done(err);
          if (!user) {
            User.create(profileData, (err, addedUser) => {
              if (err) return done(err);
              return done(null, addedUser);
            });
          } else {
            return done(null, user);
          }
        }
      );
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, 'name email username', (err, user) => {
    done(err, user);
  });
});
