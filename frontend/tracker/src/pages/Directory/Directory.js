import React, { useEffect, useState } from "react";
import {
  FolderAddOutlined,
  UploadOutlined,
  EditOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Box, Text } from "@chakra-ui/react";
import { Breadcrumb, notification } from "antd";
import { useHistory, useParams } from "react-router-dom";
import CreateFileModal from "../../components/CustomModals/CreateFileModal";
import CreateFolderModal from "../../components/CustomModals/CreateFolderModal";
import DirectoryFolderIcon from "../../components/Doc/DirectoryFolderIcon";
import Loading from "../../components/Loading/Loading";
import ToolbarOption from "../../components/Navbar/ToolbarOption";
import { fetchSubfolders } from "../../http/directory";
import { useStateValue } from "../../store/StateProvider";
import * as actionTypes from "../../store/actionTypes";
import DirectoryFileIcon from "../../components/Doc/DirectoryFileIcon";
import Preview from "../../components/Preview/Preview";
import Toolbar from "../../components/Navbar/Toolbar";
import TableData from "../../components/DataDisplay/TableData";
import moment from "moment";
import RenameModal from "../../components/CustomModals/RenameModal";
import DirectoryMoveModal from "../../components/CustomModals/DirectoryMoveModal";
import Folder from "../../components/Doc/Folder";
import File from "../../components/Doc/File";

function Directory() {
  const [store, dispatch] = useStateValue();
  const { slug } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const [openCreateFolderModal, setOpenCreateFolderModal] = useState(false);
  const [openCreateFileModal, setOpenCreateFileModal] = useState(false);
  const [folder, setFolder] = useState({});
  const [previewDoc, setPreviewDoc] = useState({});
  const [openPreview, setOpenPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [openDirectoryMoveModal, setOpenDirectoryMoveModal] = useState(false);
  const [openRenameModal, setOpenRenameModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [folderMoved, setFolderMoved] = useState(false);

  useEffect(() => {
    // setFolder({});
    setLoading(true);
    _fetchSubFolders();
    // _fetchUserArchive();
  }, [slug, openRenameModal, folderMoved]);

  useEffect(() => {
    const popbreadcrumb = () => {
      dispatch({
        type: actionTypes.POP_BREADCRUMBS,
      });
    };

    window.addEventListener("popstate", popbreadcrumb);

    return () => window.removeEventListener("popstate", popbreadcrumb);
  }, []);

  const _fetchSubFolders = async () => {
    try {
      const res = await fetchSubfolders(store.token, slug);
      const data = res.data[0];
      setFolder(data);
      setLoading(false);
      setFolderMoved(false);
    } catch (e) {
      setLoading(false);
      return notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const documentData = folder?.documents?.map((item) => {
    let name = null;
    if (item.document?.related_document.length > 0 && item.closed_by !== null) {
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

  const subFolderData = folder?.children?.map((subfolder) => {
    return {
      key: subfolder.slug,
      name: (
        <DirectoryFolderIcon
          name={subfolder.name}
          key={subfolder.id}
          slug={subfolder.slug}
        />
      ),
      date_created: null,
      type: "Folder",
      foldername: subfolder.name,
      created_at: moment(subfolder.created_at).format("DD/MM/YYYY hh:mm A"),
      subject: "-",
    };
  });

  if (loading) {
    return <Loading />;
  }

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
              <ToolbarOption
                text="Rename"
                Icon={EditOutlined}
                openModal={setOpenRenameModal}
              />
            )}
            {selectedRow.length > 0 && (
              <>
                <ToolbarOption
                  text="Move"
                  Icon={SendOutlined}
                  openModal={setOpenDirectoryMoveModal}
                />
              </>
            )}
          </Toolbar>
          <Box marginTop="20px">
            <Breadcrumb separator=">">
              <Breadcrumb.Item
                onClick={() => history.push(`/dashboard/archive/`)}
              >
                <Text
                  _hover={{ cursor: "pointer" }}
                  fontSize="0.9rem"
                  fontWeight="500"
                  as="span"
                >
                  Archive
                </Text>
              </Breadcrumb.Item>
              {store.breadcrumbs?.map((breadcrumb, idx) => {
                return (
                  <Breadcrumb.Item
                    onClick={() => {
                      dispatch({
                        type: actionTypes.REMOVE_BREADCRUMBS,
                        payload: idx,
                      });
                      history.push(`/dashboard/archive/${breadcrumb.slug}`);
                    }}
                    key={breadcrumb.slug}
                  >
                    <Text
                      _hover={{ cursor: "pointer" }}
                      fontSize="0.9rem"
                      fontWeight="500"
                      as="span"
                    >
                      {breadcrumb.name}
                    </Text>
                  </Breadcrumb.Item>
                );
              })}
            </Breadcrumb>
          </Box>
          <Box
            maxH={{ sm: "100vh", lg: "60vh" }}
            overflowY="auto"
            marginTop="20px"
          >
            <TableData
              data={[...documentData, ...subFolderData]}
              setSelectedRow={setSelectedRow}
            />
          </Box>
        </Box>
      </Box>
      {openCreateFolderModal && (
        <CreateFolderModal
          setOpenCreateFolderModal={setOpenCreateFolderModal}
          openCreateFolderModal={openCreateFolderModal}
          folderId={folder.id}
          appendSubFolder={setFolder}
          parentFolder={folder}
        />
      )}
      {openCreateFileModal && (
        <CreateFileModal
          setOpenCreateFileModal={setOpenCreateFileModal}
          openCreateFileModal={openCreateFileModal}
          folderId={folder.id}
          appendFile={setFolder}
          parentFolder={folder}
          submitting={submitting}
          setSubmitting={setSubmitting}
        />
      )}
      {openPreview && (
        <Preview setOpenPreview={setOpenPreview} doc={previewDoc} />
      )}
      <RenameModal
        openRenameModal={openRenameModal}
        setOpenRenameModal={setOpenRenameModal}
        type={selectedRow[0]?.type}
        selectedRow={selectedRow}
      />
      {openDirectoryMoveModal && (
        <DirectoryMoveModal
          openDirectoryMoveModal={openDirectoryMoveModal}
          setOpenDirectoryMoveModal={setOpenDirectoryMoveModal}
          folder={folder}
          selectedRow={selectedRow}
          setFolderMoved={setFolderMoved}
        />
      )}
    </>
  );
}

export default Directory;
