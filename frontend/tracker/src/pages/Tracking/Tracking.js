import React from "react";
import "./Tracking.css";
import { Box } from "@chakra-ui/react";
import EmptyPage from "../../components/EmptyPage/EmptyPage";
import Loading from "../../components/Loading/Loading";
import TrackingCard from "../../components/TrackingCard/TrackingCard";
import { fetchOutgoing } from "../../http/document";
import useFetchData from "../../hooks/useFetchData";
import Lottie from "react-lottie";
import * as animationData from "../../assets/animation/locator.json";

function Tracking() {
  const { loading, data: outgoing } = useFetchData(fetchOutgoing);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  return (
    <Box>
      <h2 className="tracking__header">Document Locator</h2>
      <hr className="divider" />
      {!loading ? (
        <Box>
          {outgoing.length > 0 ? (
            <Box display="flex" marginTop="2rem">
              <Box
                width="fit-content"
                maxH={{ sm: "85vh", lg: "75vh" }}
                overflowY="auto"
                paddingRight="10px"
                flex="0.4"
              >
                {outgoing.map((item) => {
                  const user = item.receiver;
                  const user_department = item.receiver.department?.name;
                  const doc = item.document;
                  const id = item.document.id;

                  return (
                    <TrackingCard
                      key={item.id}
                      receiver={`${user.first_name} ${user.last_name}`}
                      deparment={user_department}
                      document={doc}
                      id={id}
                    />
                  );
                })}
              </Box>
              <Box marginLeft="10rem" flex="0.6" height="fit-content">
                <Lottie options={defaultOptions} />
              </Box>
            </Box>
          ) : (
            <EmptyPage type="tracking" />
          )}
        </Box>
      ) : (
        <Loading />
      )}
    </Box>
  );
}

export default Tracking;
