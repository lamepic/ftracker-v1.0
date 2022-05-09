import React, { useEffect, useState } from "react";
import { Button, Modal, notification } from "antd";
import GridData from "../DataDisplay/GridData";
import { Box, CircularProgress, Image, Text } from "@chakra-ui/react";
import { capitalize, getFolderDifference } from "../../utility/helper";
import {
  checkFolderEncryption,
  encryptFolder,
  fetchFolders,
  fetchParentFolder,
  fetchSubfolders,
  move,
} from "../../http/directory";
import { useStateValue } from "../../store/StateProvider";
import swal from "sweetalert";
import folderIcon from "../../assets/icons/folder.svg";

function DirectoryMoveModal({
  openDirectoryMoveModal,
  setOpenDirectoryMoveModal,
  folder,
  selectedRow,
  setFolderMoved,
}) {
  const [store, dispatch] = useStateValue();
  const [loading, setLoading] = useState(false);
  const [modalFolders, setModalFolders] = useState([...folder.children]);
  const [openedFolder, setOpenedFolder] = useState(folder);
  const [parentFolder, setParentFolder] = useState({});

  const handleCancel = () => {
    setOpenDirectoryMoveModal(false);
  };

  useEffect(() => {
    getParentFolder();
  }, [openedFolder]);

  const getParentFolder = async () => {
    const slug = openedFolder.slug;
    try {
      if (slug !== undefined) {
        const res = await fetchParentFolder(store.token, slug);
        if (res.data.length === 0) {
          setParentFolder({
            name: "archive",
          });
        } else {
          setParentFolder(res.data);
        }
      }
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
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
                setOpenedFolder(item);
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
      setOpenedFolder(item);
      setModalFolders([...data.children]);
    } catch (e) {
      setLoading(false);
      return notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const handleGoBack = async () => {
    try {
      setOpenedFolder(parentFolder);
      if (parentFolder.name.toLowerCase() !== "archive") {
        const res = await fetchSubfolders(store.token, parentFolder.slug);
        const data = res.data[0];
        setModalFolders([...data?.children]);
      } else {
        const res = await fetchFolders(store.token);
        const data = res.data;
        setModalFolders(data);
      }
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
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
      route: "directory",
    };

    try {
      const res = await move(store.token, data);
      if (res.status === 201) {
        setOpenDirectoryMoveModal(false);
        setFolderMoved(true);
        notification.success({
          message: "Success",
          description: res.data.message,
        });
      }
    } catch (e) {
      setOpenDirectoryMoveModal(false);
      notification.error({
        message: "Error",
        decription: e.response.data.detail,
      });
    }
  };

  return (
    <>
      <Modal
        title={capitalize(openedFolder.name)}
        visible={openDirectoryMoveModal}
        onCancel={handleCancel}
        footer={[
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            key="footer"
          >
            {openedFolder.name.toLowerCase() !== "archive" && (
              <>
                {Object.keys(parentFolder).length > 0 ? (
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
                ) : (
                  <Button
                    type="primary"
                    style={{ marginLeft: "auto" }}
                    onClick={handleMoveHere}
                  >
                    Move here
                  </Button>
                )}
              </>
            )}
          </Box>,
        ]}
        width={700}
      >
        {!loading ? (
          <GridData>
            {getFolderDifference(modalFolders, selectedRow).map((folder) => {
              return (
                <Box
                  onClick={(e) => handleItemClick(e, folder)}
                  key={folder.id}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Image src={folderIcon} />
                  <Text color="var(--dark-brown)" fontWeight="500" isTruncated>
                    {capitalize(folder.name)}
                  </Text>
                </Box>
              );
            })}
          </GridData>
        ) : (
          <CircularProgress />
        )}
      </Modal>
    </>
  );
}

export default DirectoryMoveModal;
