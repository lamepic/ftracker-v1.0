import React from "react";
import "./Login.css";
import { Box, Heading, Image, Text } from "@chakra-ui/react";
import logo from "../../assets/images/logo.png";
import login_banner from "../../assets/images/landing-page-image.png";
import LoginCard from "../../components/LoginCard/LoginCard";

function Login() {
  return (
    <Box
      bg="var(--semi-dark-brown)"
      w="100%"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg="var(--white)"
        w="80%"
        h="80%"
        display={{ sm: "block", lg: "flex" }}
      >
        <Box flex={{ lg: "0.7" }} display={{ sm: "none", lg: "block" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginTop="3rem"
            marginLeft="18%"
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <Image src={logo} alt="logo" w="90px" objectFit="contain" />
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                color="var(--dark-brown)"
              >
                <Text fontSize={{ lg: "sm", sm: "xs" }} fontWeight="700">
                  Ghana Cocoa Board
                </Text>
                <Text fontSize={{ sm: "0.5rem" }} fontWeight="600">
                  Poised to Maintain Premium Quality Cocoa
                </Text>
              </Box>
            </Box>
            <Box
              fontSize={{ lg: "8.4rem" }}
              marginRight={{ lg: "3rem" }}
              textTransform="uppercase"
              marginTop="auto"
            >
              <Heading
                as="h2"
                color="var(--dark-brown)"
                textAlign="end"
                fontSize={{ lg: "2.3rem", md: "1.5rem", sm: "1rem" }}
              >
                Manage
              </Heading>
              <Heading
                as="h2"
                color="var(--light-brown)"
                fontWeight="500"
                fontSize={{ lg: "2.3rem", md: "1.5rem", sm: "1rem" }}
              >
                Your Files here.
              </Heading>
            </Box>
          </Box>
          <Box marginTop="25px">
            <Image
              src={login_banner}
              alt="logo"
              objectFit="contain"
              marginLeft="50px"
              w="80%"
              h="auto"
            />
          </Box>
        </Box>
        <Box flex={{ lg: "0.3", sm: "1" }} h={{ sm: "100%", lg: "auto" }}>
          <LoginCard />
        </Box>
      </Box>
    </Box>
  );
}

export default Login;
