import axios, { auth_axios } from "../utility/axios";

// load user
export async function loadUser(token) {
  const config = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("user/", config);
  return res;
}

// load all users
export async function loadUsers(token) {
  const config = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("users/", config);
  return res;
}

// load departments
export async function departments(token) {
  const config = {
    headers: {
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("departments/", config);
  return res;
}

// email confirmation
export async function confirmEmail(email) {
  const body = {
    email,
  };

  const res = await auth_axios.post("users/reset_password/", body);
  return res;
}

// reset password
export async function resetPassword(data) {
  const body = {
    uid: data.uid,
    token: data.token,
    new_password: data.password,
    re_new_password: data.re_new_password
  };

  const res = await auth_axios.post("users/reset_password_confirm/", body);
  return res;
}
