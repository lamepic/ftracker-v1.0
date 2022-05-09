import React from "react";
import "./Tracking.css";
import { Box } from "@chakra-ui/react";
import EmptyPage from "../../components/EmptyPage/EmptyPage";
import Loading from "../../components/Loading/Loading";
import TrackingCard from "../../components/TrackingCard/TrackingCard";
import { fetchOutgoing } from "../../http/document";
import useFetchData from "../../hooks/useFetchData";

function Tracking() {
  const { loading, data: outgoing } = useFetchData(fetchOutgoing);

  if (loading) {
    return <Loading />;
  }

  return (
    <Box>
      <h2 className="tracking__header">Document Tracking</h2>
      <hr className="divider" />
      {outgoing.length > 0 ? (
        <Box
          width="fit-content"
          marginTop="10px"
          maxH={{ sm: "85vh", lg: "75vh" }}
          overflowY="auto"
          paddingRight="10px"
        >
          {outgoing.map((item) => {
            const user = item.receiver;
            const user_department = item.receiver.department?.name;
            const doc = item.document;
            const id = item.document.id;
            const meta_info = item.meta_info;

            return (
              <TrackingCard
                key={item.id}
                receiver={`${user.first_name} ${user.last_name}`}
                deparment={user_department}
                document={doc}
                id={id}
                meta_info={meta_info}
              />
            );
          })}
        </Box>
      ) : (
        <EmptyPage type="tracking" />
      )}
    </Box>
  );
}

export default Tracking;
