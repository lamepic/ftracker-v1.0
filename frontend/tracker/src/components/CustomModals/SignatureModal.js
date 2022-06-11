import React, { useEffect, useRef, useState } from "react";
import { Box, Spinner } from "@chakra-ui/react";
import { Button, Modal, notification } from "antd";
import SignatureCanvas from "react-signature-canvas";
import { addSignature } from "../../http/document";
import { useStateValue } from "../../store/StateProvider";
import { useHistory } from "react-router-dom";
import { ArrowLeftOutlined, ArrowRightOutlined } from "@ant-design/icons";

function SignatureModal({
  openSignatureModal,
  setOpenSignatureModal,
  doc,
  setOpenPreview,
}) {
  const history = useHistory();
  const [store, dispatch] = useStateValue();
  const docViewerRef = useRef(null);
  const [pdfViewport, setPdfViewport] = useState();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [mousePosition, setMousePosition] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    var pdfjsLib = window["pdfjs-dist/build/pdf"];

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "//cdn.jsdelivr.net/npm/pdfjs-dist@2.6.347/build/pdf.worker.js";

    var pdfDoc = null,
      pageNum = 1,
      pageRendering = false,
      pageNumPending = null,
      scale = 1.3,
      canvas = document.getElementById("the-canvas"),
      ctx = canvas.getContext("2d");

    function renderPage(num) {
      pageRendering = true;
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function (page) {
        var viewport = page.getViewport({ scale: scale });
        setPdfViewport(viewport);
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function () {
          pageRendering = false;
          if (pageNumPending !== null) {
            // New page rendering is pending
            renderPage(pageNumPending);
            pageNumPending = null;
          }
        });
      });

      // Update page counters
      document.getElementById("page_num").textContent = num;
    }

    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    function queueRenderPage(num) {
      if (pageRendering) {
        pageNumPending = num;
      } else {
        renderPage(num);
      }
    }

    /**
     * Displays previous page.
     */
    function onPrevPage() {
      if (pageNum <= 1) {
        return;
      }
      pageNum--;
      queueRenderPage(pageNum);
    }
    document.getElementById("prev").addEventListener("click", onPrevPage);

    /**
     * Displays next page.
     */
    function onNextPage() {
      if (pageNum >= pdfDoc.numPages) {
        return;
      }
      pageNum++;
      queueRenderPage(pageNum);
    }
    document.getElementById("next").addEventListener("click", onNextPage);

    /**
     * Asynchronously downloads PDF.
     */
    pdfjsLib
      .getDocument(`${process.env.REACT_APP_BASE_PATH}${doc?.content}`)
      .promise.then(function (pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById("page_count").textContent = pdfDoc.numPages;

        // Initial/first page rendering
        renderPage(pageNum);
      });
  }, []);

  function showCoordinate(x_pos, y_pos) {
    var selected = pdfViewport.convertToPdfPoint(x_pos, y_pos);
    let x = selected[0];
    let y = selected[1];
    return { x, y };
  }

  const handleClick = async (e) => {
    e.stopPropagation();
    setOpenSignatureModal({ open: true, type: openSignatureModal.type });
    const pdfCanvas = document
      .getElementsByClassName("pdfCanvas")[0]
      .getBoundingClientRect();
    const x = e.clientX - pdfCanvas.left;
    const y = e.clientY - pdfCanvas.top;
    const position = showCoordinate(x, y);
    setMousePosition(position);
    const pageNumber = document.getElementById("page_num").textContent;
    switch (openSignatureModal.type) {
      case "sign":
        setShowSignaturePad(true);
        break;
      case "append":
        try {
          setLoading(true);
          const data = {
            mousePosition: position,
            doc_id: doc.id,
            type: "signature",
            pageNumber,
          };
          const res = await addSignature(store.token, data);
          if (res.status === 200) {
            notification.success({
              message: "Success",
              description: "Signature added",
            });
            setOpenSignatureModal(false);
          }
        } catch (e) {
          notification.error({
            description: "Error",
            message: e.response.data.detail,
          });
        } finally {
          setLoading(false);
          // setOpenPreview(true);
        }
        break;
      case "stamp":
      case "copyDocumentStamp":
        try {
          setLoading(true);
          const data = {
            mousePosition: position,
            doc_id: doc.id,
            type: openSignatureModal.type,
            pageNumber,
          };
          const res = await addSignature(store.token, data);
          if (res.status === 200) {
            notification.success({
              message: "Success",
              description: "Stamp added",
            });
            setOpenSignatureModal(false);
          }
        } catch (e) {
          notification.error({
            description: "Error",
            message: e.response.data.detail,
          });
        } finally {
          setLoading(false);
        }
        break;
      default:
        break;
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
        {loading && (
          <Box
            position="absolute"
            left="37rem"
            zIndex="1000"
            width="150px"
            height="100px"
            borderRadius="8px"
            backgroundColor="#e2e2e2"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Spinner size="xl" color="var(--dark-brown)" thickness="4px" />
          </Box>
        )}
        <Box
          ref={docViewerRef}
          style={{ width: "70%", height: "100%", overflowY: "scroll" }}
          className="pdfBox"
          display="flex"
          flexDirection="column"
          alignItems="center"
          bg="#2A2A2E"
          position="relative"
          onClick={(e) => {
            e.stopPropagation();
            setOpenSignatureModal({
              open: true,
              type: openSignatureModal.type,
            });
          }}
        >
          <Box
            width="100%"
            bg="#38383D"
            color="#fff"
            onClick={() =>
              setOpenSignatureModal({
                open: true,
                type: openSignatureModal.type,
              })
            }
          >
            <Button id="prev" icon={<ArrowLeftOutlined />}></Button>
            <Button id="next" icon={<ArrowRightOutlined />}></Button>
            &nbsp; &nbsp;
            <span>
              Page: <span id="page_num"></span> / <span id="page_count"></span>
            </span>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            onClick={(e) => handleClick(e)}
            paddingBottom="20px"
            paddingTop="20px"
          >
            <canvas id="the-canvas" className="pdfCanvas"></canvas>
          </Box>
        </Box>
      </Box>
      {showSignaturePad && (
        <SignaturePad
          showSignaturePad={showSignaturePad}
          setShowSignaturePad={setShowSignaturePad}
          doc={doc}
          setOpenSignatureModal={setOpenSignatureModal}
          mousePosition={mousePosition}
        />
      )}
    </>
  );
}

export default SignatureModal;

const SignaturePad = ({
  showSignaturePad,
  setShowSignaturePad,
  doc,
  mousePosition,
  setOpenSignatureModal,
}) => {
  const [loading, setLoading] = useState(false);
  const canvas = useRef(null);
  const signaturePadRef = useRef(null);
  const [colors, setColors] = useState("black");
  const [store, dispatch] = useStateValue();
  const history = useHistory();

  const handleOk = async () => {
    setLoading(true);
    try {
      const signatureImage = signaturePadRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      const pageNumber = document.getElementById("page_num").textContent;
      const data = {
        mousePosition,
        doc_id: doc.id,
        signatureImage,
        pageNumber: pageNumber,
      };
      const res = await addSignature(store.token, data);
      if (res.status === 200) {
        notification.success({
          message: "Success",
          description: "Signature added",
        });
        setShowSignaturePad(false);
        setOpenSignatureModal(false);
      }
    } catch (e) {
      notification.error({
        description: "Error",
        message: e.response?.data.detail,
      });
    } finally {
      signaturePadRef.current.clear();
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowSignaturePad(false);
  };
  return (
    <Modal
      visible={showSignaturePad}
      // title="Title"
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={() => signaturePadRef.current.clear()}>
          Clear
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleOk}
        >
          Append
        </Button>,
      ]}
      bodyStyle={{ padding: "0" }}
    >
      <div
        ref={canvas}
        style={{
          borderBottom: "1px solid #eee",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <SignatureCanvas
          penColor={colors}
          canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
          ref={signaturePadRef}
          maxWidth="1.5"
        />
      </div>
      <Box display="flex">
        {["black", "red", "blue"].map((color) => {
          return (
            <Box
              padding="10px"
              onClick={() => setColors(color)}
              key={color}
              cursor="pointer"
              transition="all 1s ease-in"
            >
              <Box
                border={`1px solid ${color}`}
                width="30px"
                height="30px"
                borderRadius="50%"
                display="grid"
                placeItems="center"
              >
                <Box
                  width="20px"
                  height="20px"
                  borderRadius="50%"
                  bg={colors === color ? colors : ""}
                ></Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Modal>
  );
};
