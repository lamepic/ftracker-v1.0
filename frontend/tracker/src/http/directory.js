import axios from "../utility/axios";

export async function fetchFolders(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("folders/", config);
  return res;
}

export async function fetchSubfolders(token, slug) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`folders/${slug}`, config);
  return res;
}

export async function createFolder(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post("folders/", data, config);
  return res;
}

export async function createFile(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const formData = new FormData();

  formData.append("file", data.file);
  formData.append("subject", data.subject);
  formData.append("reference", data.reference);
  formData.append("parentFolderId", data.parentFolderId);
  formData.append("filename", data.filename);
  if (data.password !== undefined) {
    formData.append("password", data.password);
  }

  const res = await axios.post("file/", formData, config);
  return res;
}

export async function checkFolderEncryption(token, slug) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`encrypt-folder/${slug}/`, config);
  return res;
}

export async function encryptFolder(token, slug, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post(`encrypt-folder/${slug}/`, data, config);
  return res;
}

export async function checkFileEncryption(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`encrypt-file/${id}/`, config);
  return res;
}

export async function encryptFile(token, id, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post(`encrypt-file/${id}/`, data, config);
  return res;
}

export async function rename(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post("rename/", data, config);
  return res;
}

export async function fetchParentFolder(token, slug) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`parent-folder/${slug}/`, config);
  return res;
}

export async function move(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post("move/", data, config);
  return res;
}
