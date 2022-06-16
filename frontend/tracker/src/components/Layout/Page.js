import React from "react";
import File from "../Doc/File";
import Folder from "../Doc/Folder";
import Loading from "../Loading/Loading";
import EmptyPage from "../EmptyPage/EmptyPage";
import { capitalize } from "../../utility/helper";
import { Box, Grid, GridItem, Image, Text } from "@chakra-ui/react";
import addIcon from "../../assets/icons/add-icon.svg";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

function Page({ loading, data, type }) {
  const history = useHistory();

  const onBack = () => history.goBack();

  if (loading) {
    return <Loading />;
  }

  if (type.toLowerCase() === "incoming") {
    const copy = data?.copy.map((item) => {
      item.type = "copyIncoming";
      return item;
    });
    const incoming = data?.incoming.map((item) => {
      item.type = "incoming";
      return item;
    });
    const activated_document = data.activated_document?.map((item) => {
      item.type = "activatedDocument";
      return item;
    });

    const incoming_data = [...incoming, ...copy, ...activated_document];

    return (
      <>
        {incoming_data.length > 0 ? (
          <Box>
            <Box marginTop="10px">
              <Box display="flex" alignItems="center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    cursor: "pointer",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--dark-brown)"
                  strokeWidth={2}
                  onClick={onBack}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                <Text
                  as="h2"
                  fontSize={{ sm: "1.5rem", lg: "1.7rem" }}
                  color="var(--dark-brown)"
                  fontWeight="600"
                  marginLeft="10px"
                >
                  {capitalize(type)}
                </Text>
              </Box>

              <Box maxH={{ sm: "100vh", lg: "80vh" }} overflowY="auto">
                <Grid templateColumns="repeat(6, 1fr)" gap={6} marginTop="10px">
                  {incoming_data.map((item) => {
                    if (item.document?.related_document > 0) {
                      return (
                        <GridItem key={item.document.id}>
                          <Folder doc={item} type={item.type} />
                        </GridItem>
                      );
                    } else {
                      return (
                        <GridItem key={item.document.id}>
                          <File doc={item} type={item.type} />
                        </GridItem>
                      );
                    }
                  })}
                </Grid>
              </Box>
            </Box>
            <Box
              position="fixed"
              right={{ sm: "60px", lg: "68px" }}
              bottom={{ sm: "10px", lg: "20px" }}
            >
              <Link to="/dashboard/add-document">
                <Image src={addIcon} boxSize="45px" />
              </Link>
            </Box>
          </Box>
        ) : (
          <EmptyPage type={type} />
        )}
      </>
    );
  } else {
    return (
      <>
        {data.length > 0 ? (
          <Box>
            <Box marginTop="10px">
              <Box display="flex" alignItems="center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  style={{
                    width: "1.5rem",
                    height: "1.5rem",
                    cursor: "pointer",
                  }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--dark-brown)"
                  strokeWidth={2}
                  onClick={onBack}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16l-4-4m0 0l4-4m-4 4h18"
                  />
                </svg>
                <Text
                  as="h2"
                  fontSize={{ sm: "1.5rem", lg: "1.7rem" }}
                  color="var(--dark-brown)"
                  fontWeight="600"
                  marginLeft="10px"
                >
                  {capitalize(type)}
                </Text>
              </Box>

              <Box maxH={{ sm: "100vh", lg: "80vh" }} overflowY="auto">
                <Grid templateColumns="repeat(6, 1fr)" gap={6}>
                  {data.map((item) => {
                    if (item.related_document > 0) {
                      return (
                        <GridItem key={item.document.id}>
                          <Folder doc={item} type={type} />
                        </GridItem>
                      );
                    } else {
                      return (
                        <GridItem key={item.document.id}>
                          <File doc={item} type={type} />
                        </GridItem>
                      );
                    }
                  })}
                </Grid>
              </Box>
            </Box>
            <Box
              position="fixed"
              right={{ sm: "60px", lg: "68px" }}
              bottom={{ sm: "10px", lg: "20px" }}
            >
              <Link to="/dashboard/add-document">
                <Image src={addIcon} boxSize="45px" />
              </Link>
            </Box>
          </Box>
        ) : (
          <EmptyPage type={type} />
        )}
      </>
    );
  }
}

export default Page;
