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
import logo from "../../assets/images/highways.png";
import SidebarOption from "./SidebarOption";
import tracker from "../../assets/icons/tracker-icon.svg";
import flow from "../../assets/icons/flow-icon.svg";
import home from "../../assets/icons/home-icon.svg";
import { Link } from "react-router-dom";
import { useStateValue } from "../../store/StateProvider";

function Sidebar({ onClose, isOpen }) {
  const [store, dispatch] = useStateValue();
  return (
    <>
      <Box h="100%" bg="#0281A4" display={{ sm: "none", lg: "block" }}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          bg="#f4f4f4"
          paddingBottom="15px"
        >
          <Link to="/dashboard">
            <Image
              src={logo}
              alt="logo"
              w="90px"
              objectFit="contain"
              marginTop="20px"
            />
          </Link>
        </Box>
        <Box marginTop="5rem">
          <Link to="/dashboard">
            <SidebarOption icon={home} name="home" />
          </Link>
          <Link to="/dashboard/locator">
            <SidebarOption icon={tracker} name="locator" />
          </Link>
          {store.user?.is_department && (
            <Link to="/dashboard/create-flow">
              <SidebarOption icon={flow} name="create flow" />
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
                <Link to="/dashboard/locator" onClick={onClose}>
                  <SidebarOption icon={tracker} name="locator" />
                </Link>
                {store.user?.is_department && (
                  <Link to="/dashboard/create-flow" onClick={onClose}>
                    <SidebarOption icon={flow} name="create flow" />
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
