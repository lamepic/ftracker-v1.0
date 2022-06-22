import React, { useState } from "react";
import { useStateValue } from "../../store/StateProvider";
import * as actionTypes from "../../store/actionTypes";
import { Button, Card } from "antd";
import { Box, Text } from "@chakra-ui/react";
import Preview from "../Preview/Preview";

function TrackingCard({ receiver, deparment, document, id }) {
  const [store, dispatch] = useStateValue();
  const [openPreviewModal, setOpenPreviewModal] = useState(false);

  const openTrackingDetail = () => {
    dispatch({
      type: actionTypes.SET_TRACKING_DOC_ID,
      payload: id,
    });

    dispatch({
      type: actionTypes.SET_OPEN_TRACKING_MODAL,
      payload: true,
    });
  };
  return (
    <>
      <Card
        style={{
          // minWidth: 450,
          backgroundColor: "#f4f4f4",
          marginBottom: "10px",
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Text fontSize="16px" color="var(--dark-brown)" fontWeight="600">
              Sent To: {receiver}
            </Text>
            <Text fontSize="16px">Department: {deparment} </Text>
            <Text fontSize="16px">Document: {document.subject} </Text>
          </Box>
          <Box display="flex" flexDirection="column">
            <Button
              onClick={() => openTrackingDetail()}
              size="small"
              style={{ marginBottom: "5px" }}
            >
              Locate
            </Button>
            <Button onClick={() => setOpenPreviewModal(true)} size="small">
              View
            </Button>
          </Box>
        </Box>
      </Card>
      {openPreviewModal && (
        <Preview setOpenPreview={setOpenPreviewModal} doc={document} />
      )}
    </>
  );
}

export default TrackingCard;
