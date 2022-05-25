import { Box, Button } from "@chakra-ui/react";
import { notification } from "antd";
import React, { useEffect, useRef, useState } from "react";
import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import swal from "sweetalert";
import SignatureCanvas from "react-signature-canvas";
import { addSignature } from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import { useHistory } from "react-router-dom";
import { PDFJSViewer } from "pdfjs-dist/web/pdf_viewer";

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
  const [pdfViewport, setPdfViewport] = useState();

  useEffect(() => {
    var pdfjsLib = window["pdfjs-dist/build/pdf"];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "//cdn.jsdelivr.net/npm/pdfjs-dist@2.6.347/build/pdf.worker.js";

    var loadingTask = pdfjsLib.getDocument(
      `${process.env.REACT_APP_DOCUMENT_PATH}${doc?.content.doc_file}`
    );
    loadingTask.promise.then(
      function (pdf) {
        console.log("PDF loaded");

        // Fetch the first page
        var pageNumber = 1;
        pdf.getPage(pageNumber).then(function (page) {
          console.log("Page loaded");

          var scale = 1.3;
          var viewport = page.getViewport({ scale: scale });
          setPdfViewport(viewport);

          // Prepare canvas using PDF page dimensions
          var canvas = document.getElementById("the-canvas");
          var context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          var renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          var renderTask = page.render(renderContext);
          renderTask.promise.then(function () {
            console.log("Page rendered");
          });
        });
      },
      function (reason) {
        // PDF loading error
        console.error(reason);
      }
    );
  }, []);

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

  function showCoordinate(x_pos, y_pos) {
    // var x = event.clientX;
    // var y = event.clientY;

    var selected = pdfViewport.convertToPdfPoint(x_pos, y_pos);
    let x = selected[0];
    let y = selected[1];
    return { x, y };
  }

  const handleClick = async (e) => {
    e.stopPropagation();

    // setOpenSignatureModal({ open: true, type: openSignatureModal.type });
    const pdfCanvas = document
      .getElementsByClassName("pdfCanvas")[0]
      .getBoundingClientRect();

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - pdfCanvas.left;
    const y = e.clientY - pdfCanvas.top;

    const mousePosition = showCoordinate(x, y);
    console.log(mousePosition);

    try {
      switch (openSignatureModal.type) {
        case "sign":
          swal({
            content: canvas.current,
            buttons: true,
            closeModal: false,
          }).then(async (willSubmit) => {
            if (willSubmit) {
              const signatureImage = signaturePadRef.current
                .getTrimmedCanvas()
                .toDataURL("image/png");
              const data = {
                mousePosition,
                doc_id: doc.id,
                signatureImage,
              };
              const res = await addSignature(store.token, data);
              console.log(res.data);
              if (res.status === 200) {
                swal.stopLoading();
                swal.close();
                setSignatureAdded(true);
                notification.success({
                  message: "Success",
                  description: "Signature added",
                });
              }
            }
          });
          break;
        case "append":
          try {
            const data = {
              mousePosition,
              doc_id: doc.id,
              type: "signature",
            };
            const res = await addSignature(store.token, data);
            if (res.status === 200) {
              setSignatureAdded(true);
              notification.success({
                message: "Success",
                description: "Signature added",
              });
            }
          } catch (e) {
            notification.error({
              description: "Error",
              message: e.response.data.detail,
            });
          }
          break;
        case "stamp":
          try {
            const data = {
              mousePosition,
              doc_id: doc.id,
              type: "stamp",
            };
            const res = await addSignature(store.token, data);
            if (res.status === 200) {
              setSignatureAdded(true);
              notification.success({
                message: "Success",
                description: "Stamp added",
              });
            }
          } catch (e) {
            notification.error({
              description: "Error",
              message: e.response.data.detail,
            });
          }
          break;
        default:
          break;
      }
    } catch (e) {
      swal.stopLoading();
      swal.close();
      notification.error({
        description: "Error",
        message: e.response.data.detail,
      });
    } finally {
      signaturePadRef.current.clear();
    }
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
          style={{ width: "854px", height: "100%", overflowY: "scroll" }}
          className="pdfBox"
        >
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            onClick={(e) => handleClick(e)}
          >
            <canvas id="the-canvas" className="pdfCanvas"></canvas>
            <Box border="1px solid red" width="50%">
              <Button id="prev" width="10px">
                Previous
              </Button>
              <Button id="next" width="10px">
                Next
              </Button>
              &nbsp; &nbsp;
              <span>
                Page: <span id="page_num"></span> /{" "}
                <span id="page_count"></span>
              </span>
            </Box>
          </Box>
          <div
            ref={canvas}
            style={{
              border: "1px solid red",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
              ref={signaturePadRef}
              maxWidth="1"
            />
            <Box>
              <Box
                border="1px solid red"
                width="20px"
                height="20px"
                borderRadius="50%"
              ></Box>
            </Box>
          </div>
        </div>
      </Box>
    </>
  );
}

export default SignatureModal;
