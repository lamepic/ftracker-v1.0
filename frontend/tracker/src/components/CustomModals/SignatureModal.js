import { Box, EditablePreview } from "@chakra-ui/react";
import { Button, Modal } from "antd";
import React, { useRef, useState } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import swal from "sweetalert";
import SignatureCanvas from "react-signature-canvas";
import { addSignature } from "../../http/document";
import { useStateValue } from "../../store/StateProvider";

function SignatureModal({ openSignatureModal, setOpenSignatureModal, doc }) {
  const [store, dispatch] = useStateValue();
  const canvas = useRef(null);
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const [modalText, setModalText] = React.useState("Content of the modal");
  const [mousePos, setMousePos] = useState({});

  const handleOk = () => {
    setModalText("The modal will be closed after two seconds");
    setConfirmLoading(true);
    setTimeout(() => {
      setOpenSignatureModal(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const handleCancel = () => {
    setOpenSignatureModal(false);
  };

  const docs = [
    { uri: `${process.env.REACT_APP_DOCUMENT_PATH}${doc?.content}` },
  ];

  const handleClick = async (e) => {
    e.stopPropagation();
    setOpenSignatureModal(true);
    // setMousePos()
    const mousePosition = { x: e.screenX, y: e.screenY };
    const data = {
      mousePosition,
      doc_id:doc.id
    };

    swal({ content: canvas.current, buttons: true }).then(
      async (willSubmit) => {
        if (willSubmit) {
          const res = await addSignature(store.token, data);
        //   if (res.status === 200) {
        //     swal("Your signature has been added", {
        //       icon: "success",
        //     });
        //   }
        }
      }
    );
  };

  console.log(mousePos);

  return (
    <>
      {/* <Modal
        title="Add Signature"
        visible={openSignatureModal}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        style={{ top: 20 }}
        width={1000}
      >
        <Box display="flex" justifyContent="space-between">
          <Box flex="0.7" border="1px solid red" minH="70vh">
            <DocViewer
              documents={docs}
              pluginRenderers={DocViewerRenderers}
              style={{ width: "100%", height: "100%" }}
            //   onClick={(e) => setMousePos({ x: e.screenX, y: e.screenY })}
            />
          </Box>
          <Box flex="0.3" border="1px solid black" minH="70vh">
            <p>Sigg</p>
          </Box>
        </Box>
      </Modal> */}
      <div ref={canvas}>
        <SignatureCanvas
          penColor="green"
          canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
        />
      </div>
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
        onClick={() => setOpenSignatureModal(false)}
      >
        <DocViewer
          documents={docs}
          pluginRenderers={DocViewerRenderers}
          style={{ width: "70%", height: "100%" }}
          onClick={handleClick}
        />
      </Box>
    </>
  );
}

export default SignatureModal;
