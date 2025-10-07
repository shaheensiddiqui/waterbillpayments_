function validateUserInput({ name, email, password }) {
  if (!name || name.length < 2) throw new Error("Name too short");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Invalid email");
  if (!password || password.length < 6)
    throw new Error("Password must be ≥ 6 chars");
}

module.exports = { validateUserInput };
