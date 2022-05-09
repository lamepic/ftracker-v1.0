import { Box } from "@chakra-ui/react";
import "./HomeOption.css";
import React from "react";
import CustomBadge from "../Badge/CustomBadge";

function HomeOption({ icon, text, count }) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      position="relative"
      alignItems="center"
      justifyContent="center"
      padding="10px"
      _hover={{ bg: "#e3bc97" }}
      borderRadius="10px"
      transition="all 0.3s ease-in"
    >
      <div className="homeOption__icon">
        <img src={icon} alt={`${text}-icon`} />
        {count >= 0 && <CustomBadge count={count} size="28px" />}
      </div>
      <p className="homeOption__text">{text}</p>
    </Box>
  );
}

export default HomeOption;
