export function getStoredUser() {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
}

export function setStoredUser(user: any) {
  localStorage.setItem("user", JSON.stringify(user));
}

export function removeStoredUser() {
  localStorage.removeItem("user");
}
