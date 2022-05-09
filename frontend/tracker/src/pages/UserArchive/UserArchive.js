import { Box, Grid, GridItem, Image, Text } from "@chakra-ui/react";
import { notification } from "antd";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import File from "../../components/Doc/File";
import Folder from "../../components/Doc/Folder";
import { fetchUserArchive } from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import { capitalize } from "../../utility/helper";
import addIcon from "../../assets/icons/add-icon.svg";
import EmptyPage from "../../components/EmptyPage/EmptyPage";
import Loading from "../../components/Loading/Loading";

function UserArchive() {
  const [store, dispatch] = useStateValue();
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    _fetchUserArchive();
  }, []);

  const _fetchUserArchive = async () => {
    try {
      const res = await fetchUserArchive(store.token, store.user.staff_id);
      const data = res.data;
      setArchive(data);
      console.log(data);
      setLoading(false);
    } catch (e) {
      setLoading(false);
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {archive.length > 0 ? (
        <Box>
          <Box marginTop="10px">
            <Text
              as="h2"
              fontSize={{ sm: "1.5rem", lg: "1.7rem" }}
              color="var(--dark-brown)"
              fontWeight="600"
            >
              Personal Archive
            </Text>

            <Box maxH={{ sm: "100vh", lg: "80vh" }} overflowY="auto">
              <Grid templateColumns="repeat(6, 1fr)" gap={6}>
                {archive.map((item) => {
                  if (item.document?.related_document?.length > 0) {
                    return (
                      <GridItem key={item.document.id}>
                        <Folder doc={item} type="personalArchive" />
                      </GridItem>
                    );
                  } else {
                    return (
                      <GridItem key={item.document.id}>
                        <File doc={item} type="personalArchive" />
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
        <EmptyPage type="archive" />
      )}
    </>
  );
}

export default UserArchive;
