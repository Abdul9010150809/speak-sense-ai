const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const operation = process.argv[2] || "stats";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const connect = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in environment");
  }
  await mongoose.connect(process.env.MONGO_URI);
};

const close = async () => {
  await mongoose.disconnect();
};

const runStats = async () => {
  const totalUsers = await User.countDocuments();
  const localUsers = await User.countDocuments({ authProvider: "local" });
  const socialUsers = await User.countDocuments({ authProvider: { $ne: "local" } });

  console.log(JSON.stringify({ totalUsers, localUsers, socialUsers }, null, 2));
};

const runListUsers = async () => {
  const users = await User.find({}, "name email authProvider createdAt")
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  console.log(JSON.stringify(users, null, 2));
};

const runCreateUser = async () => {
  const rawEmail = process.env.DBOPS_EMAIL || "dbops.user@speaksense.ai";
  const email = normalizeEmail(rawEmail);
  const name = process.env.DBOPS_NAME || "DB Ops User";
  const rawPassword = process.env.DBOPS_PASSWORD || "DbopsUser@123";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(JSON.stringify({ message: "User already exists", email }, null, 2));
    return;
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    authProvider: "local"
  });

  console.log(JSON.stringify({ message: "User created", id: user._id, email: user.email }, null, 2));
};

const runUpdateUser = async () => {
  const email = normalizeEmail(process.env.DBOPS_EMAIL);
  const company = process.env.DBOPS_COMPANY || "SpeakSense";
  const jobTitle = process.env.DBOPS_JOB_TITLE || "Interview Candidate";

  if (!email) {
    throw new Error("Set DBOPS_EMAIL to update a user");
  }

  const updated = await User.findOneAndUpdate(
    { email },
    { $set: { company, jobTitle } },
    { new: true }
  );

  if (!updated) {
    console.log(JSON.stringify({ message: "User not found", email }, null, 2));
    return;
  }

  console.log(JSON.stringify({
    message: "User updated",
    email: updated.email,
    company: updated.company,
    jobTitle: updated.jobTitle
  }, null, 2));
};

const runDeleteUser = async () => {
  const email = normalizeEmail(process.env.DBOPS_EMAIL);

  if (!email) {
    throw new Error("Set DBOPS_EMAIL to delete a user");
  }

  const deleted = await User.findOneAndDelete({ email });

  if (!deleted) {
    console.log(JSON.stringify({ message: "User not found", email }, null, 2));
    return;
  }

  console.log(JSON.stringify({ message: "User deleted", email: deleted.email }, null, 2));
};

const run = async () => {
  await connect();

  if (operation === "stats") {
    await runStats();
  } else if (operation === "list-users") {
    await runListUsers();
  } else if (operation === "create-user") {
    await runCreateUser();
  } else if (operation === "update-user") {
    await runUpdateUser();
  } else if (operation === "delete-user") {
    await runDeleteUser();
  } else {
    throw new Error(`Unsupported operation: ${operation}`);
  }
};

run()
  .then(async () => {
    await close();
  })
  .catch(async (error) => {
    console.error(error.message);
    await close();
    process.exit(1);
  });
