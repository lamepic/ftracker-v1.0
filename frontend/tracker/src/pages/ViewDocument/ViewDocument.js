import React, { useEffect, useState } from "react";
import "./ViewDocument.css";
import {
  Box,
  Button,
  Text,
  Image,
  Grid,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import Loading from "../../components/Loading/Loading";
import {
  createMinute,
  fetchDocument,
  fetchDocumentCopy,
  fetchNextUserToForwardDoc,
  forwardDocument,
  markComplete,
  previewCode,
} from "../../http/document";
import swal from "sweetalert";
import { useStateValue } from "../../store/StateProvider";
import { useHistory, useParams } from "react-router-dom";
import Preview from "../../components/Preview/Preview";
import { notification } from "antd";
import ForwardModal from "../../components/ForwardModal/ForwardModal";
import useIcon from "../../hooks/useIcon";
import SignatureModal from "../../components/CustomModals/SignatureModal";
import { capitalize } from "../../utility/helper";
import UpdateDocumentModal from "../../components/CustomModals/UpdateDocumentModal";

function ViewDocument() {
  const [store] = useStateValue();
  const history = useHistory();
  const { id, type } = useParams();
  const [document, setDocument] = useState(null);
  const [minute, setMinute] = useState("");
  const [loading, setLoading] = useState(true);
  const [openPreview, setOpenPreview] = useState(false);
  const [code, setCode] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [nextReceiver, setNextReceiver] = useState(null);
  const [previewDoc, setPreviewDoc] = useState({});
  const [submittingMinute, setSubmittingMinute] = useState(false);
  const [openSignatureModal, setOpenSignatureModal] = useState({
    open: false,
    type: "",
  });
  const [openUpdateDocumentModal, setOpenUpdateDocumentModal] = useState(false);
  const [documentUpdated, setDocumentUpdated] = useState(false);

  const [filename, setFilename] = useState("");
  const icon = useIcon(filename);

  useEffect(() => {
    fetchPreviewCode();
    _fetchDocument();
    if (
      type.toLowerCase() !== "copy" &&
      type.toLowerCase() !== "personalarchive"
    )
      _fetchNextUserToForwardDoc();
  }, [documentUpdated, store.socketSignal]);

  const _fetchDocument = async () => {
    try {
      if (type === "personalArchive") {
        const res = await fetchDocumentCopy(store.token, id);
        const data = res.data;
        setDocument(data);
        setFilename(data.filename);
      } else {
        const res = await fetchDocument(store.token, id);
        const data = res.data;
        setDocument(data);
        setFilename(data.filename);
      }
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    } finally {
      setLoading(false);
    }
  };

  const _fetchNextUserToForwardDoc = async () => {
    try {
      const res = await fetchNextUserToForwardDoc(store.token, id);
      const data = res.data;
      setNextReceiver(data);
    } catch (e) {
      return notification.error({
        message: "Error",
        description: e.repsonse.data.detail,
      });
    }
  };

  const fetchPreviewCode = async () => {
    try {
      const res = await previewCode(store.token, store.user.staff_id, id);
      const data = res.data;
      setCode(data[0]);
    } catch (e) {
      return notification.error({
        message: "Error",
        description: e.repsonse.data.detail,
      });
    }
  };

  const handleMarkComplete = async () => {
    try {
      swal({
        title: "Are you sure you want to Archive this document?",
        text: "This action is irreversible",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then(async (willSubmit) => {
        if (willSubmit) {
          const res = await markComplete(store.token, id);
          if (res.status === 200) {
            swal("Document has been marked as complete", {
              icon: "success",
            });
            history.push("/");
          }
        }
      });
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const handleMinute = async (e) => {
    try {
      e.preventDefault();
      setSubmittingMinute(true);
      const res = await createMinute(store.token, id, minute);
      const data = res.data;
      if (res.status === 201) {
        setDocument({ ...document, minute: [data, ...document.minute] });
        setMinute("");
      }
    } catch (e) {
      return notification.error({
        message: "Error",
        description: e.repsonse.data.detail,
      });
    } finally {
      setSubmittingMinute(false);
    }
  };

  const handleForwardDocument = async () => {
    try {
      if (
        document.document_type === null ||
        document.document_type.name.toLowerCase() === "custom"
      ) {
        setOpenModal(true);
      } else {
        swal({
          title: `Are you sure you want to Forward this Document to ${nextReceiver.receiver.first_name} ${nextReceiver.receiver.last_name}?`,
          text: "Forwarding of this Document is irreversible",
          icon: "warning",
          button: {
            text: "Forward",
            closeModal: false,
          },
          dangerMode: true,
        }).then(async (willSubmit) => {
          if (willSubmit) {
            const data = {
              receiver: nextReceiver.receiver.staff_id,
              document,
            };
            const res = await forwardDocument(store.token, data);
            if (res.status === 201) {
              setOpenModal(false);
              history.replace("/dashboard/outgoing");
              swal("Document has been sent succesfully", {
                icon: "success",
              });
            }
          }
        });
      }
    } catch (e) {
      return notification.error({
        message: "Error",
        description: e.repsonse.data.detail,
      });
    }
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
    if (code) {
      if (!code?.used) {
        swal("Enter secret token to view this Document", {
          content: "input",
        }).then(async (value) => {
          if (value) {
            const user_id = store.user.staff_id;
            const document_id = document.id;
            const data = {
              code: value,
            };
            try {
              const res = await previewCode(
                store.token,
                user_id,
                document_id,
                data
              );
              if (res.status === 200) {
                setCode({ ...previewCode, used: true });
                setOpenPreview(true);
              }
            } catch (error) {
              notification.error({
                message: "Error",
                description: "Wrong token",
              });
            }
          }
        });
      } else {
        setOpenPreview(true);
      }
    } else {
      setOpenPreview(true);
    }
  };

  if (!loading && document === null) {
    return <div>404</div>;
  }

  return (
    <>
      {!loading ? (
        <Box marginTop={{ sm: "2rem", lg: "1.2rem" }}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            maxWidth="900px"
            overflowX="auto"
            whiteSpace="nowrap"
          >
            <span
              style={{ marginRight: "10px", cursor: "pointer" }}
              onClick={() => history.goBack()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1.5rem"
                height="1.5rem"
                fill="none"
                viewBox="0 0 24 24"
                stroke="var(--dark-brown)"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
            </span>
            <Text
              fontWeight="600"
              marginRight="20px"
              textTransform="capitalize"
              color="#fff"
              _hover={{ cursor: "pointer" }}
              fontSize="15px"
              padding="2px 8px"
              bg="#005475"
              borderRadius="50px"
            >
              {capitalize(document.subject.toLowerCase())}
            </Text>
            {document?.related_document.map((doc) => {
              return (
                <Text
                  key={doc.id}
                  onClick={() => handlePreview(doc)}
                  fontWeight="600"
                  marginRight="20px"
                  textTransform="capitalize"
                  color="var(--dark-brown)"
                  _hover={{ cursor: "pointer" }}
                  fontSize="16px"
                >
                  {capitalize(doc.subject.toLowerCase())}
                </Text>
              );
            })}
          </Box>
          <Box
            marginTop={{ sm: "2rem", lg: "1rem" }}
            display="flex"
            justifyContent="space-around"
          >
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              flex="0.3"
            >
              <Box
                h="270px"
                w="250px"
                marginTop="10px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                borderRadius="10px"
              >
                {document.created_by.staff_id === store.user.staff_id && (
                  <Box
                    marginLeft="auto"
                    cursor="pointer"
                    onClick={() => setOpenUpdateDocumentModal(true)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.5rem"
                      height="1.5rem"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="var(--dark-brown)"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Box>
                )}

                <Image
                  src={icon}
                  alt="file"
                  width="500px"
                  onClick={() => handlePreview(document)}
                  cursor="pointer"
                />
              </Box>
              <Box margin="auto" marginTop="20px">
                {type === "incoming" && (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    {document.document_type.name !== "Custom" ? (
                      !nextReceiver?.last_receiver && (
                        <Grid placeItems="center">
                          <Button
                            className="file-btn forward"
                            onClick={() => handleForwardDocument()}
                            isDisabled={
                              code === undefined ? false : !code?.used
                            }
                          >
                            Forward
                          </Button>
                        </Grid>
                      )
                    ) : (
                      <Button
                        className="file-btn forward"
                        onClick={() => handleForwardDocument()}
                        isDisabled={code === undefined ? false : !code?.used}
                        marginRight="10px"
                      >
                        Forward
                      </Button>
                    )}
                    {document.document_type.name !== "Custom" ? (
                      nextReceiver?.last_receiver && (
                        <Button
                          className="file-btn submit"
                          onClick={handleMarkComplete}
                          isDisabled={code === undefined ? false : !code?.used}
                        >
                          Archive
                        </Button>
                      )
                    ) : (
                      <Button
                        className="file-btn submit"
                        onClick={handleMarkComplete}
                        isDisabled={code === undefined ? false : !code?.used}
                      >
                        Archive
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Box>
            {type !== "copy" && (
              <>
                <div className={`vr ${type !== "incoming" && "vr-sm"}`}></div>
                <div className="file-info">
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <div
                      className={`minute-box-preview ${
                        type !== "incoming" && "minute-box-preview-lg"
                      }`}
                    >
                      <div>
                        {document?.minute?.map((item) => {
                          return (
                            <div className="minute" key={item?.id}>
                              <p>{item?.content}</p>
                              <p className="employee">{item?.user}</p>
                              <p className="date">
                                Date:{" "}
                                {new Date(item?.created_at).toDateString()}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Box>
                  {type === "incoming" && (
                    <form
                      onSubmit={(e) => {
                        handleMinute(e);
                      }}
                    >
                      <textarea
                        name="minutes"
                        cols="35"
                        rows="7"
                        placeholder="Please add minutes here..."
                        onChange={(e) => setMinute(e.target.value)}
                        value={minute}
                      ></textarea>
                      <Box
                        w="100%"
                        marginTop="5px"
                        display="flex"
                        justifyContent="end"
                      >
                        {document.content !== null && (
                          <Box>
                            {store.user.is_department ? (
                              <Button
                                className="file-btn stamp"
                                marginLeft="auto"
                                marginRight="10px"
                                onClick={() => {
                                  setOpenSignatureModal({
                                    open: true,
                                    type: "stamp",
                                  });
                                }}
                                isDisabled={
                                  code === undefined ? false : !code?.used
                                }
                              >
                                Add stamp
                              </Button>
                            ) : (
                              <Menu _focus={{ outline: "none" }}>
                                <MenuButton
                                  as={Button}
                                  rightIcon={<ChevronDownIcon />}
                                  className="file-btn signature"
                                  marginLeft="auto"
                                  marginRight="10px"
                                  isDisabled={
                                    code === undefined ? false : !code?.used
                                  }
                                >
                                  Signature
                                </MenuButton>
                                <MenuList>
                                  <MenuItem
                                    onClick={() =>
                                      setOpenSignatureModal({
                                        open: true,
                                        type: "sign",
                                      })
                                    }
                                  >
                                    Sign
                                  </MenuItem>
                                  <MenuItem
                                    onClick={() =>
                                      setOpenSignatureModal({
                                        open: true,
                                        type: "append",
                                      })
                                    }
                                  >
                                    Append Signature
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            )}
                          </Box>
                        )}
                        <Button
                          type="submit"
                          className="minute-button"
                          isDisabled={!minute}
                          isLoading={submittingMinute}
                        >
                          Add Minute
                        </Button>
                      </Box>
                    </form>
                  )}
                </div>
              </>
            )}
          </Box>
        </Box>
      ) : (
        <Loading />
      )}
      {openPreview && (
        <Preview setOpenPreview={setOpenPreview} doc={previewDoc} />
      )}
      {openModal && (
        <ForwardModal
          document={document}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      )}
      {openSignatureModal.open && (
        <SignatureModal
          openSignatureModal={openSignatureModal}
          setOpenSignatureModal={setOpenSignatureModal}
          doc={document}
          setOpenPreview={setOpenPreview}
        />
      )}
      {openUpdateDocumentModal && (
        <UpdateDocumentModal
          setOpenUpdateDocumentModal={setOpenUpdateDocumentModal}
          openUpdateDocumentModal={openUpdateDocumentModal}
          document={document}
          setDocumentUpdated={setDocumentUpdated}
          documentUpdated={documentUpdated}
        />
      )}
    </>
  );
}

export default ViewDocument;
