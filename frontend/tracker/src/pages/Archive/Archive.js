import React, { useEffect, useState } from "react";

import { useStateValue } from "../../store/StateProvider";
import Folder from "../../components/Doc/Folder";
import File from "../../components/Doc/File";
import { fetchUserArchive } from "../../http/document";
import Loading from "../../components/Loading/Loading";
import { Box, Stack, Text } from "@chakra-ui/react";
import {
  FolderAddOutlined,
  UploadOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import ToolbarOption from "../../components/Navbar/ToolbarOption";
import CreateFolderModal from "../../components/CustomModals/CreateFolderModal";
import CreateFileModal from "../../components/CustomModals/CreateFileModal";
import {
  checkFolderEncryption,
  encryptFolder,
  fetchFolders,
} from "../../http/directory";
import DirectoryFolderIcon from "../../components/Doc/DirectoryFolderIcon";
import * as actionTypes from "../../store/actionTypes";
import DirectoryFileIcon from "../../components/Doc/DirectoryFileIcon";
import Preview from "../../components/Preview/Preview";
import { notification, Skeleton } from "antd";
import Toolbar from "../../components/Navbar/Toolbar";
import TableData from "../../components/DataDisplay/TableData";
import moment from "moment";
import RenameModal from "../../components/CustomModals/RenameModal";
import MoveModal from "../../components/CustomModals/MoveModal";
import swal from "sweetalert";

function Archive() {
  const [store, dispatch] = useStateValue();
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);
  const [folderLoading, setFolderLoading] = useState(true);
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);
  const [openCreateFileModal, setOpenCreateFileModal] = useState(false);
  const [folders, setFolders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [openMoveModal, setOpenMoveModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [folderMoved, setFolderMoved] = useState(false);
  const [folderCreated, setFolderCreated] = useState(false);

  const _fetchUserArchive = async () => {
    try {
      const res = await fetchUserArchive(store.token, store.user.staff_id);
      const data = res.data;
      setArchive(data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const _fetchFolders = async () => {
    try {
      const res = await fetchFolders(store.token);
      const data = res.data;
      setFolders(data);
      dispatch({
        type: actionTypes.CLEAR_BREADCRUMBS,
      });
      setFolderLoading(false);
      setFolderMoved(false);
    } catch (e) {
      setFolderLoading(false);
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  useEffect(() => {
    _fetchUserArchive();
    _fetchFolders();
  }, [openRenameModal, folderMoved, folderCreated]);

  const folderData = folders.map((folder) => {
    return {
      key: folder.created_at,
      name: (
        <DirectoryFolderIcon
          name={folder.name}
          key={folder.id}
          slug={folder.slug}
        />
      ),
      date_created: null,
      type: "Folder",
      foldername: folder.name,
      created_at: moment(folder.created_at).format("DD/MM/YYYY hh:mm A"),
      subject: "-",
    };
  });

  const archiveData = archive.map((item) => {
    let name = null;
    if (item.document.related_document.length > 0 && item.closed_by !== null) {
      name = <Folder doc={item} key={item.document.id} type="archive" />;
    } else if (item.closed_by !== null) {
      name = <File doc={item} key={item.document.id} type="archive" />;
    } else {
      name = (
        <DirectoryFileIcon
          key={item.document.id}
          setPreviewDoc={setPreviewDoc}
          setOpenPreview={setOpenPreview}
          document={item.document}
        />
      );
    }
    return {
      name: name,
      subject: item.document.subject,
      created_at: moment(item.document.created_at)
        .utc()
        .format("DD/MM/YYYY hh:mm A"),
      type: "File",
      key: item.document.id,
      filename: item.document.filename,
    };
  });

  const handleRenameModal = async () => {
    try {
      const checkpass = await checkFolderEncryption(
        store.token,
        selectedRow[0].name.props.slug
      );
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
              const passRes = await encryptFolder(
                store.token,
                selectedRow[0].name.props.slug,
                {
                  password: value,
                }
              );
              if (passRes.data.success) {
                setOpenRenameModal(true);
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
        setOpenRenameModal(true);
      }
    } catch (err) {
      return notification.error({
        message: "Error",
        description: err.response.data.detail,
      });
    }
  };

  // if (folderLoading || loading) {
  //   return <Loading />;
  // }

  return (
    <>
      <Box>
        <Box marginTop="10px">
          <Text
            as="h2"
            fontSize={{ sm: "1.5rem", lg: "1.7rem" }}
            color="var(--dark-brown)"
            fontWeight="600"
          >
            Archive
          </Text>
          <Toolbar>
            <ToolbarOption
              text="New Folder"
              Icon={FolderAddOutlined}
              openModal={setOpenCreateFolderModal}
            />
            <ToolbarOption
              text="Upload File"
              Icon={UploadOutlined}
              openModal={setOpenCreateFileModal}
            />
            {selectedRow.length === 1 && (
              <Box
                display="flex"
                alignItems="center"
                _hover={{
                  cursor: "pointer",
                  backgroundColor: "var(--lightest-brown)",
                }}
                marginRight="10px"
                transition="all 0.3s ease-in-out"
                padding="8px"
                onClick={() => handleRenameModal()}
              >
                <EditOutlined
                  style={{
                    fontSize: "25px",
                    marginRight: "5px",
                    color: "var(--dark-brown)",
                  }}
                />
                <Text color="var(--dark-brown)" fontWeight="500">
                  Rename
                </Text>
              </Box>
            )}
            {selectedRow.length > 0 && (
              <>
                <ToolbarOption
                  text="Move"
                  Icon={SendOutlined}
                  openModal={setOpenMoveModal}
                />
              </>
            )}
          </Toolbar>
          {!(folderLoading || loading) ? (
            <Box>
              {archive.length + folders.length ? (
                <Box
                  maxH={{ sm: "100vh", lg: "70vh" }}
                  overflowY="auto"
                  marginTop="20px"
                >
                  <TableData
                    data={[...archiveData, ...folderData]}
                    setSelectedRow={setSelectedRow}
                  />
                </Box>
              ) : (
                <Box>
                  <Text
                    textAlign="center"
                    as="h3"
                    color="var(--light-brown)"
                    fontSize="3rem"
                    textTransform="uppercase"
                    marginTop="10rem"
                  >
                    Archive is Empty
                  </Text>
                </Box>
              )}
            </Box>
          ) : (
            <Box marginTop="20px">
              <Stack>
                {Array.from({ length: 8 }).map((item, idx) => {
                  return (
                    <Skeleton.Button
                      active={loading}
                      size="default"
                      shape="square"
                      block={true}
                      key={idx}
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
      {openCreateFolderModal && (
        <CreateFolderModal
          setOpenCreateFolderModal={setOpenCreateFolderModal}
          openCreateFolderModal={openCreateFolderModal}
          addFolder={setFolders}
          parentFolder={folders}
          setFolderCreated={setFolderCreated}
        />
      )}
      {openCreateFileModal && (
        <CreateFileModal
          setOpenCreateFileModal={setOpenCreateFileModal}
          openCreateFileModal={openCreateFileModal}
          submitting={submitting}
          setSubmitting={setSubmitting}
          appendFileToArchive={setArchive}
          parentFolder={archive}
        />
      )}
      {openPreview && (
        <Preview setOpenPreview={setOpenPreview} doc={previewDoc} />
      )}
      {openRenameModal && (
        <RenameModal
          openRenameModal={openRenameModal}
          setOpenRenameModal={setOpenRenameModal}
          type={selectedRow[0]?.type}
          selectedRow={selectedRow}
        />
      )}
      {openMoveModal && (
        <MoveModal
          openMoveModal={openMoveModal}
          setOpenMoveModal={setOpenMoveModal}
          folders={folders}
          setFolderMoved={setFolderMoved}
          selectedRow={selectedRow}
        />
      )}
    </>
  );
}

export default Archive;
