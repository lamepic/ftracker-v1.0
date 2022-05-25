import React from "react";
import {
  Box,
  Image,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import logo from "../../assets/images/logo.png";
import SidebarOption from "./SidebarOption";
import tracker from "../../assets/icons/tracker-icon.svg";
import home from "../../assets/icons/home-icon.svg";
import { Link } from "react-router-dom";
import { useStateValue } from "../../store/StateProvider";

function Sidebar({ onClose, isOpen }) {
  const [store, dispatch] = useStateValue();
  return (
    <>
      <Box
        h="100%"
        bg="var(--dark-brown)"
        display={{ sm: "none", lg: "block" }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <Link to="/dashboard">
            <Image src={logo} alt="logo" w="90px" objectFit="contain" />
          </Link>
        </Box>
        <Box marginTop="5rem">
          <Link to="/dashboard">
            <SidebarOption icon={home} name="home" />
          </Link>
          <Link to="/dashboard/tracker">
            <SidebarOption icon={tracker} name="locator" />
          </Link>
          {store.user?.is_department && (
            <Link to="/dashboard/create-flow">
              <SidebarOption icon={tracker} name="create flow" />
            </Link>
          )}
        </Box>
      </Box>

      <Box display={{ sm: "block", lg: "none" }}>
        <Drawer placement="left" size="xs" onClose={onClose} isOpen={isOpen}>
          <DrawerOverlay />
          <DrawerContent bg="var(--dark-brown)">
            <DrawerHeader borderBottomWidth="1px">
              <Box display="flex" flexDirection="column" alignItems="center">
                <Image src={logo} alt="logo" w="90px" objectFit="contain" />
              </Box>
            </DrawerHeader>
            <DrawerBody>
              <Box marginTop="5rem">
                <Link to="/dashboard" onClick={onClose}>
                  <SidebarOption icon={home} name="home" />
                </Link>
                <Link to="/dashboard/tracker" onClick={onClose}>
                  <SidebarOption icon={tracker} name="tracker" />
                </Link>
                {store.user?.is_department && (
                  <Link to="/dashboard/create-flow" onClick={onClose}>
                    <SidebarOption icon={tracker} name="create flow" />
                  </Link>
                )}
              </Box>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </>
  );
}

export default Sidebar;
