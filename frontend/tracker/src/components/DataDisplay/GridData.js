import { Grid } from "@chakra-ui/react";
import React from "react";

function GridData({ children }) {
  return (
    <Grid
      templateColumns={{
        sm: "repeat(4, 1fr)",
        lg: "repeat(6, 1fr)",
      }}
      gap={6}
    >
      {children}
    </Grid>
  );
}

export default GridData;
