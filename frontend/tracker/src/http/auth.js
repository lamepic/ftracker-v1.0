import axios, { auth_axios } from "../utility/axios";

// get user email
export async function userEmail(staff_id) {
  const res = await axios.post("/auth/login/", { staff_id: staff_id });
  return res;
}

// get verification token
export async function verificationToken(email) {
  const res = await auth_axios.post("/auth/email/", { email: email });
  return res;
}

// login user
export async function login(staff_id, password) {
  const body = JSON.stringify({ staff_id, password });
  const res = await axios.post("/login/", body);
  return res;
}

export async function logout(token) {
  const config = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
  const res = await auth_axios.post("/auth/token/logout/", null, config);
  return res;
}
