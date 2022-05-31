import React from "react";
import "./Tracking.css";
import { fetchTracking } from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import * as actionTypes from "../../store/actionTypes";
import Modal from "antd/lib/modal/Modal";
import { Spinner, Text } from "@chakra-ui/react";
import { Popover, Steps } from "antd";
import useFetchData from "../../hooks/useFetchData";

function TrackingDetail() {
  const [store, dispatch] = useStateValue();
  const documentId = store.trackingDocId;
  const { loading, data: tracking } = useFetchData(fetchTracking, documentId);

  const handleOk = () => {
    dispatch({
      type: actionTypes.SET_OPEN_TRACKING_MODAL,
      payload: false,
    });
    dispatch({
      type: actionTypes.SET_TRACKING_DOC_ID,
      payload: null,
    });
  };

  return (
    <div>
      <Modal
        title="Locator"
        visible={store.openTrackingModal}
        onCancel={handleOk}
        footer={null}
        width={800}
        centered
      >
        {!loading ? (
          <Steps
            size="small"
            current={tracking.length - 1}
            style={{
              display: "grid",
              gap: "10px",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              overflowX: "none",
              padding: "20px",
            }}
          >
            {tracking.map((label, idx) =>
              tracking.length - 1 !== idx ? (
                <Steps.Step
                  description={label.name}
                  style={{ marginBottom: "2em" }}
                  title={
                    <Popover
                      content={
                        <>
                          <Text
                            fontSize="0.8rem"
                            fontWeight="500"
                            color="var(--dark-brown)"
                          >
                            Department: {label.department}
                          </Text>
                          <Text
                            fontSize="0.8rem"
                            fontWeight="500"
                            color="var(--dark-brown)"
                          >
                            Date: {new Date(label.date).toDateString()}
                          </Text>
                          <Text
                            fontSize="0.8rem"
                            fontWeight="500"
                            color="var(--dark-brown)"
                          >
                            Time: {new Date(label.date).toLocaleTimeString()}
                          </Text>
                        </>
                      }
                    >
                      <Text _hover={{ cursor: "pointer" }}>
                        {idx === 0 ? "Sent" : "Forwarded"}
                      </Text>
                    </Popover>
                  }
                  key={idx}
                />
              ) : (
                <Steps.Step
                  description={label.name}
                  style={{ marginBottom: "2em" }}
                  title={
                    <Popover
                      content={
                        <>
                          <Text
                            fontSize="0.8rem"
                            fontWeight="500"
                            color="var(--dark-brown)"
                          >
                            Department: {label.department}
                          </Text>
                          <Text
                            fontSize="0.8rem"
                            fontWeight="500"
                            color="var(--dark-brown)"
                          >
                            Date: {new Date(label.date).toDateString()}
                          </Text>
                          <Text
                            fontSize="0.8rem"
                            fontWeight="500"
                            color="var(--dark-brown)"
                          >
                            Time: {new Date(label.date).toLocaleTimeString()}
                          </Text>
                        </>
                      }
                    >
                      <Text _hover={{ cursor: "pointer" }}>In progress</Text>
                    </Popover>
                  }
                  key={idx}
                />
              )
            )}
          </Steps>
        ) : (
          <div className="loading__spinner">
            <Spinner
              thickness="3px"
              speed="0.65s"
              emptyColor="gray.200"
              color="#9d4d01"
              size="lg"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}

export default TrackingDetail;
