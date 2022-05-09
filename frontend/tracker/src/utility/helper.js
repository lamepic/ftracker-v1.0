import { notification, Upload } from "antd";

// Notifications
export const openNotificationWithIcon = (type, message, description) => {
  notification[type]({
    message,
    description,
  });
};

export const capitalize = (str) => {
  return str
    .split(" ")
    .map((text) => text.charAt(0).toUpperCase() + text.slice(1))
    .join(" ");
};

export function getFolderDifference(array1, array2) {
  return array1.filter((object1) => {
    return !array2.some((object2) => {
      return object1.slug === object2.name.props.slug;
    });
  });
}

export const uploadRules = {
  beforeUpload: (file) => {
    const isPDF = file.type === "application/pdf";
    const isDOC = file.type === "application/msword";
    const isDOCX =
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isXLS = file.type === "application/vnd.ms-excel";
    const isXLSX =
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const isTXT = file.type === "text/plain";
    const isPPT = file.type === "application/vnd.ms-powerpoint";
    const isPPTX =
      file.type ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    const isJPG = file.type === "image/jpg";
    const isJPGEG = file.type === "image/jpeg";

    if (
      isPDF ||
      isDOC ||
      isDOCX ||
      isXLS ||
      isXLSX ||
      isTXT ||
      isPPT ||
      isPPTX ||
      isJPG ||
      isJPGEG
    ) {
      return true;
    } else {
      notification.error({
        message: "Error",
        description: "Unsupported File format",
      });
      return Upload.LIST_IGNORE;
    }
  },
  // onChange: (info) => {
  //   console.log(info.fileList);
  // },
};
