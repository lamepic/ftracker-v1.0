import React, { useState } from "react";
import "./ActivateDocument.css";
import { Box, Text } from "@chakra-ui/react";
import { Button, DatePicker, notification, Space } from "antd";
import { Redirect, useHistory } from "react-router-dom";
import swal from "sweetalert";
import { activateDocument } from "../../http/document";
import pdf from "../../assets/images/pdf-img.png";
import { useStateValue } from "../../store/StateProvider";
import Preview from "../../components/Preview/Preview";
import moment from "moment";

const today = new Date();
const nextweek = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 7
);
const inFuture = (date) => {
  return date.setHours(0, 0, 0, 0) >= new Date().setHours(0, 0, 0, 0);
};

function ActivateDocument() {
  const history = useHistory();
  const [store, dispatch] = useStateValue();
  const [openPreview, setOpenPreview] = useState(false);
  const [error, setError] = useState(false);
  const [expireAt, setExpireAt] = React.useState(moment(nextweek).format());

  const handlePreview = () => {
    setOpenPreview(!openPreview);
  };

  const request = store.request_details;

  if (!request) {
    return <Redirect to="/" />;
  }
  const document = request.document;

  const handleActivateDocument = () => {
    const new_date = new Date(expireAt);
    const valid_date = inFuture(new_date);

    if (!valid_date) {
      setError(true);
      return notification.error({
        message: "Error",
        description: "Date should be in the future",
      });
    }

    const data = {
      request_id: request.id,
      receiver_id: request.requested_by.staff_id,
      document_id: request.document.id,
      expire_at: new_date,
    };

    swal({
      title: "Are you sure you want to Activate and send this Document?",
      text: "Submission of this Document is irreversible",
      icon: "warning",
      buttons: {
        cancel: "No",
        confirm: "Yes",
      },
    }).then(async (willSubmit) => {
      if (willSubmit) {
        const _data = JSON.stringify(data);
        try {
          const res = await activateDocument(store.token, _data);
          if (res.status === 201) {
            history.push("/");
            swal("Document has been activated succesfully", {
              icon: "success",
            });
          }
        } catch (e) {
          notification.error({
            message: "Error",
            description: e.response.data.detail,
          });
        }
      }
    });
  };

  return (
    <>
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
            padding="3px"
            bg="var(--lighter-brown)"
            borderRadius="50px"
          >
            {document.subject}
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
                {doc.subject}
              </Text>
            );
          })}
        </Box>
        <Box marginTop="20px" display="flex" justifyContent="space-around">
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
              backgroundColor="var(--lightest-brown)"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              borderRadius="10px"
              onClick={() => handlePreview(document)}
            >
              <img
                src={pdf}
                alt="logo"
                className="file-preview-box-img"
                style={{ width: "80%", opacity: "0.7" }}
              />
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              width="200px"
              margin="auto"
              marginTop="20px"
              alignItems="center"
            >
              <Button
                className="file-btn submit"
                style={{
                  marginTop: "5px",
                  width: "100%",
                  color: "var(--white)",
                  backgroundColor: "#009014",
                  borderColor: "none",
                }}
                onClick={handleActivateDocument}
              >
                Activate Document
              </Button>
              <Space>
                <DatePicker
                  width="10px"
                  onChange={(date, dateString) => {
                    setError(false);
                    setExpireAt(dateString);
                  }}
                  value={error ? "" : expireAt.dateString}
                  className="date"
                />
              </Space>
            </Box>
          </Box>
          <div className="vr vr-sm"></div>

          <div className="file-info">
            <div className={`minute-box-preview`}>
              <div>
                {document?.minute?.map((item) => {
                  return (
                    <div className="minute" key={item?.id}>
                      <p>{item?.content}</p>
                      <p className="employee">{item?.user}</p>
                      <p className="date">
                        Date: {new Date(item?.date).toDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Box>
      </Box>

      {openPreview && (
        <Preview setOpenPreview={setOpenPreview} doc={document} />
      )}
    </>
  );
}

export default ActivateDocument;
