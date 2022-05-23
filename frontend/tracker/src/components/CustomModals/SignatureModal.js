import { Box } from "@chakra-ui/react";
import { notification } from "antd";
import React, { useRef } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import swal from "sweetalert";
import SignatureCanvas from "react-signature-canvas";
import { addSignature } from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import { useHistory } from "react-router-dom";

function SignatureModal({
  openSignatureModal,
  setOpenSignatureModal,
  doc,
  setSignatureAdded,
}) {
  const canvas = useRef(null);
  const signaturePadRef = useRef(null);
  const [store, dispatch] = useStateValue();
  const [confirmLoading, setConfirmLoading] = React.useState(false);
  const docViewerRef = useRef(null);
  const history = useHistory();

  const handleOk = () => {
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
    { uri: `${process.env.REACT_APP_DOCUMENT_PATH}${doc?.content.doc_file}` },
  ];

  const handleClick = async (e) => {
    e.stopPropagation();
    console.log(docViewerRef.current);

    // setOpenSignatureModal({ open: true, type: openSignatureModal.type });
    // const pdfCanvas = document
    //   .getElementsByClassName("react-pdf__Page__textContent")[0]
    //   .getBoundingClientRect();

    // // const rect = e.target.getBoundingClientRect();
    // const x = e.clientX - pdfCanvas.left;
    // const y = e.clientY - pdfCanvas.top;
    // const mousePosition = { x, y };

    // try {
    //   switch (openSignatureModal.type) {
    //     case "sign":
    //       swal({
    //         content: canvas.current,
    //         buttons: true,
    //         closeModal: false,
    //       }).then(async (willSubmit) => {
    //         if (willSubmit) {
    //           const signatureImage = signaturePadRef.current
    //             .getTrimmedCanvas()
    //             .toDataURL("image/png");
    //           const data = {
    //             mousePosition,
    //             doc_id: doc.id,
    //             signatureImage,
    //           };
    //           console.log(signatureImage);
    //           const res = await addSignature(store.token, data);
    //           console.log(res.data);
    //           if (res.status === 200) {
    //             swal.stopLoading();
    //             swal.close();
    //             setSignatureAdded(true);
    //             notification.success({
    //               message: "Success",
    //               description: "Signature added",
    //             });
    //           }
    //         }
    //       });
    //       break;
    //     case "append":
    //       try {
    //         const data = {
    //           mousePosition,
    //           doc_id: doc.id,
    //           type: "signature",
    //         };
    //         const res = await addSignature(store.token, data);
    //         if (res.status === 200) {
    //           setSignatureAdded(true);
    //           notification.success({
    //             message: "Success",
    //             description: "Signature added",
    //           });
    //         }
    //       } catch (e) {
    //         notification.error({
    //           description: "Error",
    //           message: e.response.data.detail,
    //         });
    //       }
    //       break;
    //     default:
    //       break;
    //   }
    // } catch (e) {
    //   swal.stopLoading();
    //   swal.close();
    //   notification.error({
    //     description: "Error",
    //     message: e.response.data.detail,
    //   });
    // } finally {
    //   signaturePadRef.current.clear();
    // }
  };

  return (
    <>
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
        onClick={() => setOpenSignatureModal({ open: false, type: "" })}
      >
        <div
          ref={docViewerRef}
          style={{ width: "854px", height: "100%", border: "1px solid red" }}
        >
          <DocViewer
            documents={docs}
            pluginRenderers={DocViewerRenderers}
            style={{ width: "100%", height: "100%" }}
            onClick={(e) => handleClick(e)}
            config={{
              header: {
                disableHeader: true,
                disableFileName: true,
                retainURLParams: false,
              },
            }}
          />
          <div ref={canvas}>
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
              ref={signaturePadRef}
            />
          </div>
        </div>
      </Box>
    </>
  );
}

export default SignatureModal;
