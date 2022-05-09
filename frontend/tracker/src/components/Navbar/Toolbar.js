import { Box } from "@chakra-ui/react";
import React from "react";

function Toolbar({ children }) {
  return (
    <Box
      display="flex"
      alignItems="center"
      marginTop="5px"
      borderTop="0.5px solid #000"
      borderBottom="0.5px solid #000"
    >
      {children}
    </Box>
  );
}

export default Toolbar;
