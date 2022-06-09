import { Box, Button, Grid, Image, Text } from "@chakra-ui/react";
import { notification } from "antd";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import swal from "sweetalert";
import SignatureModal from "../../components/CustomModals/SignatureModal";
import ForwardModal from "../../components/ForwardModal/ForwardModal";
import Loading from "../../components/Loading/Loading";
import Preview from "../../components/Preview/Preview";
import useIcon from "../../hooks/useIcon";
import {
  carbonCopyMarkComplete,
  createCarbonCopyMinute,
  fetchDocumentCopy,
} from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import { capitalize } from "../../utility/helper";

function ViewDocumentCopy() {
  const [store] = useStateValue();
  const history = useHistory();
  const { id, type } = useParams();
  const [document, setDocument] = useState(null);
  const [minute, setMinute] = useState("");
  const [loading, setLoading] = useState(true);
  const [openPreview, setOpenPreview] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState({});
  const [filename, setFilename] = useState("");
  const [submittingMinute, setSubmittingMinute] = useState(false);
  const [openSignatureModal, setOpenSignatureModal] = useState({
    open: false,
    type: "",
  });
  const [stamps, setStamps] = useState([]);

  const icon = useIcon(filename);

  useEffect(() => {
    _fetchDocument();
  }, []);

  const _fetchDocument = async () => {
    try {
      const res = await fetchDocumentCopy(store.token, id);
      const data = res.data;
      setDocument(data);
      setFilename(data.filename);
      console.log(data);
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
    setOpenPreview(true);
  };

  const handleForwardDocument = () => {
    setOpenModal(true);
  };

  const handleMarkComplete = () => {
    try {
      swal({
        title: "Are you sure you want to Archive this document?",
        text: "This action is irreversible",
        icon: "warning",
        buttons: true,
        dangerMode: true,
      }).then(async (willSubmit) => {
        if (willSubmit) {
          const res = await carbonCopyMarkComplete(store.token, id);
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
      const res = await createCarbonCopyMinute(store.token, id, minute);
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
            <Text
              fontWeight="600"
              marginRight="20px"
              textTransform="capitalize"
              color="var(--dark-brown)"
              _hover={{ cursor: "pointer" }}
              fontSize="15px"
              padding="2px 8px"
              bg="#e4a66c"
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
                cursor="pointer"
                borderRadius="10px"
                onClick={() => handlePreview(document)}
              >
                <Image src={icon} alt="file" width="500px" />
              </Box>
              <Box margin="auto" marginTop="20px">
                <Box display="flex" justifyContent="center" alignItems="center">
                  <Button
                    className="file-btn forward"
                    onClick={() => handleForwardDocument()}
                    marginRight="10px"
                  >
                    Forward Copy
                  </Button>
                  <Button
                    className="file-btn submit"
                    onClick={handleMarkComplete}
                  >
                    Archive
                  </Button>
                </Box>
              </Box>
            </Box>
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
                    } `}
                  >
                    <div>
                      {document?.minute?.map((item) => {
                        return (
                          <div className="minute" key={item?.id}>
                            <p>{item?.content}</p>
                            <p className="employee">{item?.user}</p>
                            <p className="date">
                              Date: {new Date(item?.created_at).toDateString()}
                            </p>
                          </div>
                        );
                      })}
                      {/* {signatures?.map((signature) => {
                          return (
                            <div className="minute" key={signature.id}>
                              <Image
                                src={`${process.env.REACT_APP_DOCUMENT_PATH}${signature.signature}`}
                                width="50%"
                              />
                              <p className="employee">
                                {signature?.user.first_name}{" "}
                                {signature?.user.last_name}
                              </p>
                              <p className="date">
                                Date:{" "}
                                {new Date(signature?.created_at).toDateString()}
                              </p>
                            </div>
                          );
                        })} */}
                    </div>
                  </div>
                  {/* {stamps.length > 0 && (
                      <div
                        className={`minute-box-preview ${
                          type !== "incoming" && "minute-box-preview-lg"
                        } ${stamps?.length > 0 && "stamp-box-preview"}`}
                      >
                        <div>
                          {stamps.map((stamp) => {
                            return (
                              <div className="minute" key={stamp.id}>
                                <Image
                                  src={`${process.env.REACT_APP_DOCUMENT_PATH}${stamp.stamp}`}
                                  width="50%"
                                />
                                <p className="employee">
                                  {stamp?.user.first_name}{" "}
                                  {stamp?.user.last_name}
                                </p>
                                <p className="date">
                                  Date:{" "}
                                  {new Date(stamp.created_at).toDateString()}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )} */}
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
                          {store.user.is_department && (
                            <>
                              {!stamps.find(
                                (stamp) =>
                                  stamp.user.staff_id === store.user.staff_id
                              ) && (
                                <Button
                                  className="file-btn stamp"
                                  marginLeft="auto"
                                  marginRight="10px"
                                  onClick={() => {
                                    setOpenSignatureModal({
                                      open: true,
                                      type: "copyDocumentStamp",
                                    });
                                  }}
                                >
                                  Add stamp
                                </Button>
                              )}
                            </>
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
          type="copy"
        />
      )}
      {openSignatureModal.open && (
        <SignatureModal
          openSignatureModal={openSignatureModal}
          setOpenSignatureModal={setOpenSignatureModal}
          doc={document}
        />
      )}
    </>
  );
}

export default ViewDocumentCopy;
