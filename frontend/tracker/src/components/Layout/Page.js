import React from "react";
import File from "../Doc/File";
import Folder from "../Doc/Folder";
import Loading from "../Loading/Loading";
import EmptyPage from "../EmptyPage/EmptyPage";
import { capitalize } from "../../utility/helper";
import { Box, Grid, GridItem, Image, Text } from "@chakra-ui/react";
import addIcon from "../../assets/icons/add-icon.svg";
import { Link } from "react-router-dom";

function Page({ loading, data, type }) {
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

    const incoming_data = [...incoming, ...copy];

    return (
      <>
        {incoming_data.length > 0 ? (
          <Box>
            <Box marginTop="10px">
              <Text
                as="h2"
                fontSize={{ sm: "1.5rem", lg: "1.7rem" }}
                color="var(--dark-brown)"
                fontWeight="600"
              >
                {capitalize(type)}
              </Text>

              <Box maxH={{ sm: "100vh", lg: "80vh" }} overflowY="auto">
                <Grid templateColumns="repeat(6, 1fr)" gap={6}>
                  {incoming_data.map((item) => {
                    if (item.document?.related_document?.length > 0) {
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
              <Text
                as="h2"
                fontSize={{ sm: "1.5rem", lg: "1.7rem" }}
                color="var(--dark-brown)"
                fontWeight="600"
              >
                {capitalize(type)}
              </Text>

              <Box maxH={{ sm: "100vh", lg: "80vh" }} overflowY="auto">
                <Grid templateColumns="repeat(6, 1fr)" gap={6}>
                  {data.map((item) => {
                    if (item.related_document.length > 0) {
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
