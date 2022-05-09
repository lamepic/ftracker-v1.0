import React, { useState } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import folder from "../../assets/icons/folder.svg";
import { useStateValue } from "../../store/StateProvider";
import * as actionTypes from "../../store/actionTypes";
import { capitalize } from "../../utility/helper";
import { checkFolderEncryption } from "../../http/directory";
import { notification } from "antd";
import PasswordModal from "../CustomModals/PasswordModal";

function DirectoryFolderIcon({ name, slug }) {
  const [store, dispatch] = useStateValue();
  const history = useHistory();
  const [openModal, setOpenModal] = useState(false);

  const handleClick = async () => {
    let data;
    try {
      const checkEncrypt = await checkFolderEncryption(store.token, slug);
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
      dispatch({
        type: actionTypes.SET_BREADCRUMBS,
        payload: { name, slug },
      });
      history.push(`/dashboard/archive/${slug}`);
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
          transition="all 500ms ease-in-out"
        >
          <Image src={folder} alt="folder" width="25px" marginRight="10px" />
          <Text
            isTruncated={true}
            fontSize="14px"
            fontWeight="600"
            color="var(--dark-brown)"
            textAlign="center"
            display="block"
          >
            {capitalize(name)}
          </Text>
        </Box>
      </Box>
      <PasswordModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        data={{ name, slug, type: "folder" }}
      />
    </>
  );
}

export default DirectoryFolderIcon;
