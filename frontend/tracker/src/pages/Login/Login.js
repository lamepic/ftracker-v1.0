import React from "react";
import "./Login.css";
import { Box, Heading, Image, Text } from "@chakra-ui/react";
import LoginImage from "../../assets/icons/login-image.svg";
import LoginCard from "../../components/LoginCard/LoginCard";

function Login() {
  return (
    <Box
      background="rgb(2,129,164)"
      bg="radial-gradient(circle, rgba(2,129,164,1) 22%, rgba(2,120,164,0.9051995798319328) 93%)"
      w="100%"
      h="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      position="relative"
    >
      <Box
        width={{ md: "15em" }}
        height="15em"
        position="absolute"
        top="-3em"
        left="-3em"
        borderRadius="50%"
        bg="inherit"
        zIndex="10"
      ></Box>
      <Box
        width="20em"
        height="20em"
        position="absolute"
        top="-5em"
        left="-5em"
        borderRadius="50%"
        bg="#f4f4f4"
        overflow="hidden"
      ></Box>
      <Box w="80%" h="80%" display={{ sm: "block", lg: "flex" }}>
        <Box flex={{ lg: "0.7" }} display={{ sm: "none", lg: "block" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            marginTop="3rem"
            marginRight="10%"
          >
            <Box
              fontSize={{ lg: "8.4rem" }}
              // marginRight={{ lg: "3rem" }}
              marginLeft="70px"
              textTransform="uppercase"
              marginTop="auto"
              color="#fff"
            >
              <Heading
                as="h2"
                // color="var(--dark-brown)"
                color="#fff"
                textAlign="end"
                fontSize={{ lg: "3rem", md: "1rem", sm: "1rem" }}
              >
                The Highway Papers
              </Heading>
              <Text
                as="p"
                // color="var(--light-brown)"
                textTransform="capitalize"
                color="#fff"
                fontWeight="500"
                fontSize={{ lg: "1rem" }}
              >
                The paperless solution.
              </Text>
            </Box>
          </Box>
          <Box marginTop="25px">
            <Image
              src={LoginImage}
              alt="logo"
              objectFit="contain"
              marginLeft="50px"
              w="70%"
              h="auto"
            />
          </Box>
        </Box>
        <Box flex={{ lg: "0.3", sm: "1" }} h={{ sm: "100%", lg: "auto" }}>
          <LoginCard />
        </Box>
      </Box>
      <Box display={{ lg: "block", md: "none" }}>
        <Box
          width="3em"
          height="40em"
          bg="#f4f4f4"
          position="absolute"
          bottom="-6em"
          right="10em"
          transform="rotate(40deg)"
        ></Box>
        <Box
          width="3em"
          height="30em"
          bg="#f4f4f4"
          position="absolute"
          bottom="-6em"
          right="7em"
          transform="rotate(40deg)"
        ></Box>
        <Box
          width="3em"
          height="20em"
          bg="#f4f4f4"
          position="absolute"
          bottom="-6em"
          right="4em"
          transform="rotate(40deg)"
        ></Box>
      </Box>
    </Box>
  );
}

export default Login;
