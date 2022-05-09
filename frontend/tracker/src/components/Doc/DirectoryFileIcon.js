import React, { useState } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import { capitalize } from "../../utility/helper";
import { checkFileEncryption } from "../../http/directory";
import { notification } from "antd";
import { useStateValue } from "../../store/StateProvider";
import PasswordModal from "../CustomModals/PasswordModal";

import useIcon from "../../hooks/useIcon";

function DirectoryFileIcon({ document, setPreviewDoc, setOpenPreview }) {
  const [store, dispatch] = useStateValue();
  const [openModal, setOpenModal] = useState(false);
  const icon = useIcon(document.filename);

  const handleClick = async () => {
    let data;
    try {
      const checkEncrypt = await checkFileEncryption(store.token, document.id);
      data = checkEncrypt.data;
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }

    if (data.encrypted === true) {
      setOpenModal(true);
    } else {
      setPreviewDoc(document);
      setOpenPreview(true);
    }
  };

  return (
    <>
      <Box onClick={() => handleClick()} _hover={{ cursor: "pointer" }}>
        <Box
          display="flex"
          flexDirection="row"
          // justifyContent="center"
          alignItems="center"
          // _hover={{ backgroundColor: "#e3bc97" }}
          transition="all 500ms ease-in-out"
        >
          <Image src={icon} alt="file" width="25px" marginRight="10px" />
          <Text
            isTruncated={true}
            fontSize="14px"
            fontWeight="600"
            color="var(--dark-brown)"
            textAlign="center"
          >
            {capitalize(document.filename.toLowerCase())}
          </Text>
        </Box>
      </Box>
      <PasswordModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        data={{ document, setOpenPreview, setPreviewDoc, type: "file" }}
      />
    </>
  );
}

export default DirectoryFileIcon;
