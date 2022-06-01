import React, { useEffect, useState } from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import { Redirect } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import { fetchDocument } from "../../http/document";
import pdf from "../../assets/images/pdf-img.png";
import { useStateValue } from "../../store/StateProvider";
import Preview from "../../components/Preview/Preview";
import useIcon from "../../hooks/useIcon";

function ActivateDocView() {
  const [store, dispatch] = useStateValue();
  const [openPreview, setOpenPreview] = useState(false);
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filename, setFilename] = useState("");
  const Icon = useIcon(filename);

  const activatedDoc = store.activatedDocumentDetails;

  useEffect(() => {
    _fetchDocument(store.token);
  }, [activatedDoc]);

  const _fetchDocument = async () => {
    const res = await fetchDocument(store.token, activatedDoc?.document.id);
    const data = res.data;
    setDocument(data);
    setFilename(data.filename);
    setLoading(false);
  };

  if (!activatedDoc) {
    return <Redirect to="/" />;
  }

  const handlePreview = () => {
    setOpenPreview(!openPreview);
  };
  return (
    <>
      {!loading ? (
        <Box marginTop={{ sm: "2rem", lg: "1.2rem" }}>
          <Box
            display="flex"
            flexDirection="row"
            alignItems="center"
            maxWidth="900px"
            overflowX="auto"
            whiteSpace="nowrap"
          >
            <Text
              fontWeight="600"
              marginRight="20px"
              textTransform="capitalize"
              color="var(--dark-brown)"
              _hover={{ cursor: "pointer" }}
              fontSize="15px"
              padding="3px"
              bg="var(--lighter-brown)"
              borderRadius="50px"
            >
              {document.subject}
            </Text>
            {document?.related_document.map((doc) => {
              return (
                <Text
                  key={doc.id}
                  onClick={() => handlePreview(doc)}
                  fontWeight="600"
                  marginRight="20px"
                  textTransform="capitalize"
                  color="var(--dark-brown)"
                  _hover={{ cursor: "pointer" }}
                  fontSize="16px"
                >
                  {doc.subject}
                </Text>
              );
            })}
          </Box>
          <Box marginTop="20px" display="flex" justifyContent="space-around">
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              flex="0.3"
            >
              <Box
                h="270px"
                w="250px"
                marginTop="10px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                cursor="pointer"
                borderRadius="10px"
                onClick={() => handlePreview(document)}
              >
                <Image src={Icon} alt="file" width="500px" />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                width="200px"
                margin="auto"
                marginTop="20px"
              >
                {openPreview && (
                  <Preview setOpenPreview={setOpenPreview} doc={document} />
                )}
              </Box>
            </Box>
            <div className="vr vr-sm"></div>

            <div className="file-info">
              <div
                className={`minute-box-preview 
                  "minute-box-preview-lg"
                `}
              >
                <div>
                  {document?.minute?.map((item) => {
                    return (
                      <div className="minute" key={item?.id}>
                        <p>{item?.content}</p>
                        <p className="employee">{item?.user}</p>
                        <p className="date">
                          Date: {new Date(item?.created_at).toDateString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Box>
        </Box>
      ) : (
        <Loading />
      )}
    </>
  );
}

export default ActivateDocView;
