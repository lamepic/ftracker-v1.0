import axios from "../utility/axios";

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

  const res = await axios.post("auth/users/reset_password/", body);
  return res;
}
