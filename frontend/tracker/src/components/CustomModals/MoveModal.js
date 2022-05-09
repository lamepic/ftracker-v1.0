import React, { useState } from "react";
import { Button, Modal, notification } from "antd";
import GridData from "../DataDisplay/GridData";
import { Box, CircularProgress, GridItem, Image, Text } from "@chakra-ui/react";
import { capitalize, getFolderDifference } from "../../utility/helper";
import { useStateValue } from "../../store/StateProvider";
import swal from "sweetalert";
import FolderIcon from "../../assets/icons/folder.svg";
import {
  checkFolderEncryption,
  encryptFolder,
  fetchSubfolders,
  move,
} from "../../http/directory";

function MoveModal({
  openMoveModal,
  setOpenMoveModal,
  folders,
  selectedRow,
  setFolderMoved,
}) {
  const [store, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const [modalFolders, setModalFolders] = useState(folders);
  const [goBackPages, setGoBackPages] = useState([]);
  const [openedFolder, setOpenedFolder] = useState({});

  const handleCancel = () => {
    setOpenMoveModal(false);
  };

  const handleItemClick = async (e, item) => {
    e.stopPropagation();
    try {
      const checkpass = await checkFolderEncryption(store.token, item.slug);
      const data = checkpass.data;

      if (data.encrypted) {
        swal("Enter Password:", {
          content: {
            element: "input",
            attributes: {
              placeholder: "Type your password",
              type: "password",
            },
          },
        }).then(async (value) => {
          if (value) {
            try {
              const passRes = await encryptFolder(store.token, item.slug, {
                password: value,
              });
              if (passRes.data.success) {
                getSubfolders(item);
              }
            } catch (e) {
              notification.error({
                message: "Error",
                description: e.response.data.detail,
              });
            }
          }
        });
      } else {
        getSubfolders(item);
      }
    } catch (err) {
      return notification.error({
        message: "Error",
        description: err.response.data.detail,
      });
    }
  };

  const getSubfolders = async (item) => {
    try {
      const res = await fetchSubfolders(store.token, item.slug);
      const data = res.data[0];
      setGoBackPages([...goBackPages, modalFolders]);
      setOpenedFolder(item);
      setModalFolders(data.children);
    } catch (e) {
      setLoading(false);
      return notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const handleGoBack = () => {
    setModalFolders(goBackPages[goBackPages.length - 1]);
    const pages = goBackPages.slice(0, goBackPages.length - 1);
    setGoBackPages(pages);
  };

  const handleMoveHere = async () => {
    const item = selectedRow.map((item) => {
      let id;
      const type = item.type.toLowerCase();
      if (type === "file") {
        id =
          item.name.props.document?.id === undefined
            ? item.name.props.doc.document?.id
            : item.name.props.document?.id;
      }

      if (type === "folder") {
        id = item.name.props.slug;
      }
      return { id, type };
    });

    const data = {
      openedFolder: openedFolder.slug,
      item: item,
      route: "archive",
    };

    try {
      const res = await move(store.token, data);
      if (res.status === 201) {
        setOpenMoveModal(false);
        setFolderMoved(true);
        notification.success({
          message: "Success",
          description: res.data.message,
        });
      }
      setGoBackPages([]);
    } catch (e) {
      setOpenMoveModal(false);
      setGoBackPages([]);
      notification.error({
        message: "Error",
        decription: e.response.data.detail,
      });
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      <Modal
        title={capitalize(openedFolder.name || "archive")}
        visible={openMoveModal}
        onCancel={handleCancel}
        footer={[
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            key="footer"
          >
            {goBackPages.length > 0 && (
              <>
                <Button type="primary" onClick={handleGoBack}>
                  Back
                </Button>{" "}
                <Button
                  type="primary"
                  style={{ marginLeft: "auto" }}
                  onClick={handleMoveHere}
                >
                  Move here
                </Button>
              </>
            )}
          </Box>,
        ]}
        width={900}
      >
        <GridData>
          {!loading &&
            getFolderDifference(modalFolders, selectedRow).map((folder) => {
              return (
                <GridItem key={folder.id}>
                  <Box
                    onClick={(e) => handleItemClick(e, folder)}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    _hover={{ cursor: "pointer" }}
                  >
                    <Image src={FolderIcon} />
                    <Text
                      color="var(--dark-brown)"
                      fontWeight="500"
                      noOfLines={2}
                      textAlign="center"
                      // fontSize="0.7rem"
                    >
                      {capitalize(folder.name)}
                    </Text>
                  </Box>
                </GridItem>
              );
            })}
        </GridData>
      </Modal>
    </>
  );
}

export default MoveModal;
