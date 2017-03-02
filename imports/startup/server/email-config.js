Accounts.emailTemplates.siteName = "AlgoHub";
Accounts.emailTemplates.from = "AlgoHub <no-reply@algohub.com>";

// Welcome email after enrolled
Accounts.emailTemplates.enrollAccount.from = function() {
  return "AlgoHub <no-reply@algohub.com>";
}
Accounts.emailTemplates.enrollAccount.subject = function (user) {
  return "Welcome to AlgoHub, " + user.username;
};
Accounts.emailTemplates.enrollAccount.text = function (user, url) {
  return "You have been selected to participate in building a better future!"
    + " To activate your account, simply click the link below:\n\n"
    + url;
};

// Verification email
Accounts.emailTemplates.verifyEmail.from = function() {
  return "AlgoHub <no-reply@algohub.com>";
}
Accounts.emailTemplates.verifyEmail.subject = function (user) {
  return "Please verify your email, " + user.username;
};
Accounts.emailTemplates.verifyEmail.text = function (user, url) {
  url = url.replace('#/', '');
  return "Hello " + user.username + ",\n\nTo verify your email, simply click the link below.\n\n" + url + "\n\nThanks.";
};

// Reset password E-mail
Accounts.emailTemplates.resetPassword.from = function() {
  return "AlgoHub <no-reply@algohub.com>";
}
Accounts.emailTemplates.resetPassword.subject = function (user) {
  return "Please reset your password on " + Meteor.absoluteUrl();
};
Accounts.emailTemplates.resetPassword.text = function (user, url) {
  url = url.replace('#/', '');
  return "Hello " + user.username + ",\n\nTo reset your password, simply click the link below.\n\n" + url + "\n\nThanks.";
};
