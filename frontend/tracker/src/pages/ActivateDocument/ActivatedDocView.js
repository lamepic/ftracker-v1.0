import React, { useEffect, useState } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import { Redirect } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import {
  fetchDocument,
  markNotificationAsRead,
  notificationsCount,
} from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import Preview from "../../components/Preview/Preview";
import useIcon from "../../hooks/useIcon";
import { capitalize } from "../../utility/helper";
import { notification } from "antd";
import * as actionTypes from "../../store/actionTypes";

function ActivateDocView() {
  const [store, dispatch] = useStateValue();
  const [openPreview, setOpenPreview] = useState(false);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filename, setFilename] = useState("");
  const Icon = useIcon(filename);

  const activatedDoc = store.activatedDocumentDetails;

  useEffect(() => {
    _fetchDocument(store.token);
  }, [activatedDoc]);

  const _fetchDocument = async () => {
    try {
      const res = await fetchDocument(store.token, activatedDoc?.document.id);
      const data = res.data;
      if (res.status === 200) {
        const readRes = await markNotificationAsRead(
          store.token,
          activatedDoc?.document.id
        );
        if (readRes.status === 200) {
          const res = await notificationsCount(store.token);
          const data = res.data;
          await dispatch({
            type: actionTypes.SET_NOTIFICATIONS_COUNT,
            payload: data.count,
          });
        }
      }
      setDocument(data);
      setFilename(data.filename);
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!activatedDoc) {
    return <Redirect to="/" />;
  }

  const handlePreview = () => {
    setOpenPreview(!openPreview);
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
              color="#fff"
              _hover={{ cursor: "pointer" }}
              fontSize="15px"
              paddingLeft="10px"
              paddingRight="10px"
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
                  paddingLeft="10px"
                  paddingRight="10px"
                >
                  {capitalize(doc.subject.toLowerCase())}
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
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                borderRadius="10px"
                onClick={() => handlePreview(document)}
              >
                <Image src={Icon} alt="file" width="500px" />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                width="200px"
                margin="auto"
                marginTop="20px"
              >
                {openPreview && (
                  <Preview setOpenPreview={setOpenPreview} doc={document} />
                )}
              </Box>
            </Box>
            <div className="vr vr-sm"></div>

            <div className="file-info">
              <div
                className={`minute-box-preview 
                  "minute-box-preview-lg"
                `}
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
                </div>
              </div>
            </div>
          </Box>
        </Box>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default ActivateDocView;
