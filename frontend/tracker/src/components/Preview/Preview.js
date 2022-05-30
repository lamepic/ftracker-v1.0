import React from "react";
import "./Preview.css";
import { Box, Text } from "@chakra-ui/react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";

function Preview({ setOpenPreview, doc }) {
  let path;
  if (doc.content !== null) {
    const content = doc.content.split("/");
    path = content[content.length - 1];
  } else {
    path = null;
  }

  const docs = [
    { uri: `${process.env.REACT_APP_DOCUMENT_PATH}${doc?.content}` },
  ];

  const openPreview = (e) => {
    e.stopPropagation();
    setOpenPreview(true);
  };

  return (
    <div>
      <Box
        display="flex"
        position="fixed"
        alignItems="center"
        justifyContent="center"
        top="0"
        left="0"
        bg="rgba(0,0,0,0.5)"
        backdropFilter="blur(4px)"
        w="100%"
        h="100%"
        zIndex="100"
        onClick={() => setOpenPreview(false)}
      >
        {path === null || path === "null" ? (
          <Box
            width="70%"
            height="100%"
            backgroundColor="var(--background-color)"
            textAlign="center"
            zIndex="800"
          >
            <Text
              as="h3"
              fontSize="3rem"
              textTransform="uppercase"
              marginTop="10rem"
            >
              Empty doc
            </Text>
            <Text as="h3" fontSize="3rem" textTransform="uppercase">
              No Preview Available
            </Text>
          </Box>
        ) : (
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            style={{ width: "70%", height: "100%" }}
            onClick={openPreview}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true,
                retainURLParams: false,
              },
            }}
          />
        )}
      </Box>
    </div>
  );
}

export default Preview;
