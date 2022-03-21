const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
    to: email,
    from: "kentinhogbonouto1@gmail.com",
    subject: "Reset password instructions",
    html: `
          <strong>
            Hello ${email}<br>
          </strong>
          <p>
            Someone has requested a link to change your password. 
            You can do this through the link below: http://127.0.0.1/auth/api/user-reset-pass/${token}
            or copy and open this link in your browser:
            <a href="http://127.0.0.1/auth/api/user-reset-pass/${token}">change password</a>
            If you didn't request this, please ignore this email.
            Your password won't change until you access the link above and create a new one.
          </p>
        `,
  };
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash("err", NO_ACCOUNT);
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((response) => {
        return sgMail.send(msg);
      })
      .then((response) => {
        console.log(response);
        res.json({ message: PASS_RESET_MAIL });
      })
      .catch((error) => {
        console.error(error);
      });
  });