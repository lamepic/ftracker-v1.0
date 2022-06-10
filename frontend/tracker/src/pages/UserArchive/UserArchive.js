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
import { useHistory } from "react-router-dom";

function UserArchive() {
  const history = useHistory();
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
      setLoading(false);
    } catch (e) {
      setLoading(false);
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const onBack = () => history.goBack();

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      {archive.length > 0 ? (
        <Box>
          <Box marginTop="10px">
            <Box
              display="flex"
              alignItems="center"
              cursor="pointer"
              onClick={onBack}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                style={{ width: "1.5rem", height: "1.5rem" }}
                fill="none"
                viewBox="0 0 24 24"
                stroke="var(--dark-brown)"
                strokeWidth={2}
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
                Personal Archive
              </Text>
            </Box>

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
