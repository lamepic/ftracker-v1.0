import { Box, Text } from "@chakra-ui/react";
import React from "react";

function ToolbarOption({ Icon, text, openModal }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      _hover={{
        cursor: "pointer",
        backgroundColor: "var(--lightest-brown)",
      }}
      marginRight="10px"
      transition="all 0.3s ease-in-out"
      padding="8px"
      onClick={() => openModal(true)}
    >
      <Icon
        style={{
          fontSize: "25px",
          marginRight: "5px",
          color: "var(--dark-brown)",
        }}
      />
      <Text color="var(--dark-brown)" fontWeight="500">
        {text}
      </Text>
    </Box>
  );
}

export default ToolbarOption;
