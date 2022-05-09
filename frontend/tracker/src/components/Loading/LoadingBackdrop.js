import { Center, Spinner } from "@chakra-ui/react";
import React from "react";

function LoadingBackdrop() {
  return (
    <Center h="100%" w="100%" bg="lightgrey" position="absolute">
      <Spinner
        thickness="4px"
        speed="0.65s"
        color="var(--light-brown)"
        size="xl"
      />
    </Center>
  );
}

export default LoadingBackdrop;
