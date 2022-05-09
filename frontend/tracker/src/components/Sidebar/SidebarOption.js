import React from "react";
import { Box, Text } from "@chakra-ui/react";
import "./Sidebar.css";

function SidebarOption({ icon, name }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      padding="10px 15px"
      marginBottom="1rem"
      className="sidebaroption"
      position="relative"
    >
      <div className="backdrop"></div>
      <img src={icon} style={{ width: "2rem" }} alt="" />
      <Text
        textTransform="capitalize"
        color="var(--lighter-brown)"
        fontSize="0.7rem"
        fontWeight="600"
        marginTop="1px"
      >
        {name}
      </Text>
    </Box>
  );
}

export default SidebarOption;
