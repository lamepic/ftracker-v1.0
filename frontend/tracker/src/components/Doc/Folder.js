import React from "react";
import "./DocIcon.css";
import { Link, useHistory } from "react-router-dom";
import { Box, Image, Text } from "@chakra-ui/react";
import { capitalize } from "../../utility/helper";
import { Badge, Popover } from "antd";
import MultipleFileIcon from "../../assets/icons/multiple-files.svg";
import { useStateValue } from "../../store/StateProvider";
import * as actionTypes from "../../store/actionTypes";

function Folder({ doc, type }) {
  const [store, dispatch] = useStateValue();
  const history = useHistory();
  if (type === "archive") {
    return (
      <Link to={`/dashboard/${type}/document/${doc.document.id}/`}>
        <Box
          display="flex"
          flexDirection="row"
          // justifyContent="center"
          alignItems="center"
          transition="all 500ms ease-in-out"
        >
          <Image
            src={MultipleFileIcon}
            alt="file"
            width="10px"
            marginRight="10px"
          />
          <Text
            isTruncated={true}
            fontSize="14px"
            fontWeight="600"
            color="var(--dark-brown)"
            textAlign="center"
            display="block"
          >
            {capitalize(doc.document.filename.toLowerCase())}
          </Text>
        </Box>
      </Link>
    );
  }

  if (type === "personalArchive") {
    const popOverContent = (
      <div>
        <Text fontWeight="500" color="var(--dark-brown)">
          {`Sent from: ${doc?.created_by?.first_name} ${doc?.created_by?.last_name}`}
        </Text>

        <Text fontWeight="500" color="var(--dark-brown)">
          Department: {doc?.created_by?.department.name}
        </Text>

        {/* <Text fontWeight="500" color="var(--dark-brown)">{`Date: ${new Date(
          doc.created_at
        ).toDateString()}`}</Text>
        <Text fontWeight="500" color="var(--dark-brown)">{`Time: ${new Date(
          doc.created_at
        ).toLocaleTimeString()}`}</Text> */}
      </div>
    );

    return (
      <Popover content={popOverContent} title="Details" placement="rightTop">
        <Link to={`/dashboard/${type}/document/${doc.document.id}/`}>
          <div className="folder">
            <Image src={MultipleFileIcon} alt="folder" w="70%" padding="10px" />
            <Text className="folder__title" noOfLines={2} maxW="120px">
              {capitalize(doc.document.filename)}
            </Text>
          </div>
        </Link>
      </Popover>
    );
  }

  if (type === "copy") {
    let type = "incoming";
    const popOverContent = (
      <div>
        <Text fontWeight="500" color="var(--dark-brown)">
          {type === "copy" &&
            `Sent from: ${doc?.sender?.first_name} ${doc?.sender?.last_name}`}
        </Text>
        {doc.sender
          ? !doc.sender.is_department && (
              <Text fontWeight="500" color="var(--dark-brown)">
                Department: {doc?.sender?.department.name}
              </Text>
            )
          : !doc.receiver.is_department && (
              <Text fontWeight="500" color="var(--dark-brown)">
                Department: {doc?.receiver?.department.name}
              </Text>
            )}
        <Text fontWeight="500" color="var(--dark-brown)">{`Date: ${new Date(
          doc.created_at
        ).toDateString()}`}</Text>
        <Text fontWeight="500" color="var(--dark-brown)">{`Time: ${new Date(
          doc.created_at
        ).toLocaleTimeString()}`}</Text>
      </div>
    );

    return (
      <Popover
        content={popOverContent}
        title="Copied Document"
        placement="rightTop"
      >
        <Link to={`/dashboard/copy/${type}/document/${doc.document.id}/`}>
          <div className="folder" style={{ position: "relative" }}>
            <Box
              position="absolute"
              top="8px"
              right="30px"
              // border="1px solid gray"
              backgroundColor="#FF4D4F"
              borderRadius="50%"
              height="19px"
              width="19px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <p style={{ color: "#fff", fontWeight: "bold" }}>C</p>
            </Box>
            <Image src={MultipleFileIcon} alt="folder" w="70%" padding="10px" />
            <Text className="folder__title" noOfLines={2} maxW="120px">
              {capitalize(doc.document.filename)}
            </Text>
          </div>
        </Link>
      </Popover>
    );
  }

  if (type === "activatedDocument") {
    let type = "incoming";
    const popOverContent = (
      <div>
        <Text fontWeight="500" color="var(--dark-brown)">
          {`Sent from: ${doc?.sender?.first_name} ${doc?.sender?.last_name}`}
        </Text>
        <Text fontWeight="500" color="var(--dark-brown)">{`Date: ${new Date(
          doc.created_at
        ).toDateString()}`}</Text>
        <Text fontWeight="500" color="var(--dark-brown)">{`Time: ${new Date(
          doc.created_at
        ).toLocaleTimeString()}`}</Text>
      </div>
    );

    const handleOpenActivatedDoc = (details) => {
      dispatch({
        type: actionTypes.SET_ACTIVATED_DOCUMENTS_DETAILS,
        payload: details,
      });
      history.push("/dashboard/activated-document");
    };

    return (
      <Popover
        content={popOverContent}
        title="Activated Document"
        placement="rightTop"
      >
        <div
          className="folder"
          style={{ position: "relative" }}
          onClick={() => handleOpenActivatedDoc(doc)}
        >
          <Box
            position="absolute"
            top="8px"
            right="30px"
            // border="1px solid gray"
            backgroundColor="#1DB954"
            borderRadius="50%"
            height="19px"
            width="19px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <p style={{ color: "#fff", fontWeight: "bold" }}>A</p>
          </Box>
          <Image src={MultipleFileIcon} alt="folder" w="70%" padding="10px" />
          <Text className="folder__title" noOfLines={2} maxW="120px">
            {capitalize(doc.document.filename)}
          </Text>
        </div>
      </Popover>
    );
  }

  const popOverContent = (
    <div>
      <Text fontWeight="500" color="var(--dark-brown)">
        {type === "incoming"
          ? `Sent from: ${doc?.sender?.first_name} ${doc?.sender?.last_name}`
          : `Sent to: ${doc?.receiver?.first_name} ${doc?.receiver?.last_name}`}
      </Text>
      {doc.sender
        ? !doc.sender.is_department && (
            <Text fontWeight="500" color="var(--dark-brown)">
              Department: {doc?.sender?.department.name}
            </Text>
          )
        : !doc.receiver.is_department && (
            <Text fontWeight="500" color="var(--dark-brown)">
              Department: {doc?.receiver?.department.name}
            </Text>
          )}
      <Text fontWeight="500" color="var(--dark-brown)">{`Date: ${new Date(
        doc.created_at
      ).toDateString()}`}</Text>
      <Text fontWeight="500" color="var(--dark-brown)">{`Time: ${new Date(
        doc.created_at
      ).toLocaleTimeString()}`}</Text>
    </div>
  );

  return (
    <Popover content={popOverContent} title="Details" placement="rightTop">
      <Link to={`/dashboard/${type}/document/${doc.document.id}/`}>
        <div className="folder">
          <Image src={MultipleFileIcon} alt="folder" w="70%" padding="10px" />
          <Text className="folder__title" noOfLines={2} maxW="120px">
            {capitalize(doc.document.filename)}
          </Text>
        </div>
      </Link>
    </Popover>
  );
}

export default Folder;
