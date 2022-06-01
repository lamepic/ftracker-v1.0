import axios from "../utility/axios";

// create document --trail
export async function createDocument(token, data) {
  const config = {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Token ${token}`,
    },
  };

  const receiver = data.receiver;
  const department = data.department;
  let document = data.document;
  let filename = null;

  const formData = new FormData();
  formData.append("receiver", receiver);
  formData.append("department", department);
  formData.append("subject", data.subject);
  formData.append("reference", data.reference);
  formData.append("documentType", data.documentType);
  formData.append("encrypt", data.encrypt);
  if (data.carbonCopy !== undefined) {
    if (data.carbonCopy.length !== 0) {
      const carbonCopy = JSON.stringify(data.carbonCopy);
      formData.append("carbonCopy", carbonCopy);
    }
  }
  if (document !== null) {
    document = document[0].originFileObj;
    filename = document.name;
    formData.append("document", document);
    formData.append("filename", filename);
  }

  for (let count = 0; count < data.attachments.length; count++) {
    formData.append(`attachment_${count}`, data.attachments[count].file);
    formData.append(
      `attachment_subject_${count}`,
      data.attachments[count].subject
    );
  }

  const res = await axios.post("create-document/", formData, config);
  return res;
}

export async function addSignature(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post("signature/", data, config);
  return res;
}
export async function addSignatureStamp(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post(
    `signature-stamp/${data.document_id}/`,
    data,
    config
  );
  return res;
}

// Number of incoming documents
export async function fetchIncomingCount(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("incoming-count/", config);
  return res;
}

// Incoming documents
export async function fetchIncoming(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("incoming/", config);
  return res;
}

// Single Incoming document trail
export async function fetchIncomingDocumentTrail(token, document_id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`incoming/${document_id}/`, config);
  return res;
}

// Number of outgoing documents
export async function fetchOutgoingCount(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("outgoing-count/", config);
  return res;
}

// Outgoing documents
export async function fetchOutgoing(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("outgoing/", config);
  return res;
}

// Individual employee archived documents
export async function fetchUserArchive(token, user_id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`archive/${user_id}/`, config);
  return res;
}

// All employee archived documents
export async function fetchArchive(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`archive/`, config);
  return res;
}

export async function fetchArchiveCount(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`archive-count/`, config);
  return res;
}

// Tracking trail of a document
export async function fetchTracking(token, document_id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`tracking/${document_id}`, config);
  return res;
}

// Minutes
export async function createMinute(token, documentId, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post(`minutes/${documentId}/`, data, config);
  return res;
}

export async function createCarbonCopyMinute(token, documentId, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post(
    `carbon-copy-minutes/${documentId}/`,
    data,
    config
  );
  return res;
}

export async function fetchDocument(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`document/${id}`, config);
  return res;
}

export async function fetchDocumentCopy(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`document-copy/${id}`, config);
  return res;
}

export async function markComplete(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post(`mark-complete/${id}/`, null, config);
  return res;
}

export async function carbonCopyMarkComplete(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post(
    `carbon-copy-mark-complete/${id}/`,
    null,
    config
  );
  return res;
}

export async function previewCode(token, user_id, document_id, data = null) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  if (data !== null) {
    const res = await axios.post(
      `preview-code/${user_id}/${document_id}/`,
      data,
      config
    );
    return res;
  } else {
    const res = await axios.get(
      `preview-code/${user_id}/${document_id}/`,
      config
    );
    return res;
  }
}

export async function fetchDocumentType(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("document-type/", config);
  return res;
}

export async function fetchDocumentAction(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`document-action/${id}/`, config);
  return res;
}

export async function forwardDocument(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const receiver = data.receiver;
  const doucument = data.document.id;

  const formData = new FormData();
  formData.append("receiver", receiver);
  formData.append("document", doucument);

  const res = await axios.post("forward-document/", formData, config);
  return res;
}

export async function forwardDocumentCopy(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const receiver = data.receiver;
  const doucument = data.document.id;

  const formData = new FormData();
  formData.append("receiver", receiver);
  formData.append("document", doucument);

  const res = await axios.post("forward-document-copy/", formData, config);
  return res;
}

export async function fetchNextUserToForwardDoc(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`forward-document/${id}/`, config);
  return res;
}

export async function SearchDocument(token, term) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`search/${term.toLowerCase()}/`, config);
  return res;
}

export async function requestDocument(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post("request-document/", data, config);
  return res;
}

export async function fetchRequest(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("request-document/", config);
  return res;
}

export async function notificationsCount(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("notifications/", config);
  return res;
}

export async function activateDocument(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post("activate-document/", data, config);
  return res;
}

export async function fetchActivateDocument(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("activate-document/", config);
  return res;
}

export async function createFlow(token, data) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.post("create-flow/", data, config);
  return res;
}

export async function fetchFlow(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("create-flow/", config);
  return res;
}

export async function documentCopy(token) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get("copy/", config);
  return res;
}

export async function references(token, id) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
  };

  const res = await axios.get(`reference/${id}`, config);
  return res;
}
