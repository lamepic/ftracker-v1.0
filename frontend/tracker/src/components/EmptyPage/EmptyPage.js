import { Box, Image, Text } from "@chakra-ui/react";
import React from "react";
import { Link } from "react-router-dom";
import "./EmptyPage.css";
import addIcon from "../../assets/icons/add-icon.svg";

function EmptyPage({ type }) {
  let header = "";

  if (type === "incoming") {
    header = "Received";
  } else if (type === "outgoing") {
    header = "Pending";
  } else if (type === "tracking") {
    header = "Tracking";
  } else {
    header = "Archive";
  }

  return (
    <Box marginTop="10px">
      <Box>
        <Text
          as="h2"
          fontSize={{ sm: "1.5rem", lg: "1.7rem" }}
          color="var(--dark-brown)"
          fontWeight="600"
        >
          {type !== "tracking" && header}
        </Text>
        <Box minH="80vh" display="flex" justifyContent="center">
          <Text
            as="h3"
            color="var(--light-brown)"
            fontSize="3rem"
            textTransform="uppercase"
            marginTop="10rem"
          >
            No {type} Files
          </Text>
        </Box>
      </Box>
      <Box
        position="fixed"
        right={{ sm: "60px", lg: "68px" }}
        bottom={{ sm: "10px", lg: "20px" }}
      >
        <Link to="/dashboard/add-document">
          <Image src={addIcon} boxSize="45px" />
        </Link>
      </Box>
    </Box>
  );
}

export default EmptyPage;
