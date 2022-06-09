import React, { useEffect, useState } from "react";
import Home from "../Home/Home";
import Flow from "../Flow/Flow";
import Archive from "../Archive/Archive";
import Incoming from "../Incoming/Incoming";
import Outgoing from "../Outgoing/Outgoing";
import Tracking from "../Tracking/Tracking";
import Directory from "../Directory/Directory";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import TrackingDetail from "../Tracking/TrackingDetail";
import ProtectedPage from "../../utility/ProtectedPage";
import ViewDocument from "../ViewDocument/ViewDocument";
import { useStateValue } from "../../store/StateProvider";
import { Box, useDisclosure } from "@chakra-ui/react";
import CreateDocument from "../CreateDocument/CreateDocument";
import ActivateDocument from "../ActivateDocument/ActivateDocument";
import ActivatedDocView from "../ActivateDocument/ActivatedDocView";
import useFetchCount from "../../hooks/useFetchCount";
import useFetchUser from "../../hooks/useFetchUser";
import { Route } from "react-router-dom";
import ViewDocumentCopy from "../ViewDocument/ViewDocumentCopy";
import UserArchive from "../UserArchive/UserArchive";
import useWebSocket, { ReadyState } from "react-use-websocket";
import addNotification from "react-push-notification";
import * as actionTypes from "../../store/actionTypes";

function Dashboard() {
  // useFetchCount(true, true, true, true);
  const [store, dispatch] = useStateValue();
  const user = useFetchUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [socketUrl, setSocketUrl] = useState(
    `ws://${process.env.REACT_APP_SOCKET_PATH}/push-notification/?token=${store?.token}`
  );
  // const [messageHistory, setMessageHistory] = useState([]);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    shouldReconnect: (e) => true,
    reconnectInterval: 4000,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      const msg = JSON.parse(lastMessage.data);
      const status = JSON.parse(msg.status);
      dispatch({
        type: actionTypes.NEW_INCOMING,
      });
      addNotification({
        title: "Cocoa Papers | Ghana Cocoa Board",
        subtitle: msg.message,
        message: `Sender: ${status.sender}\nDescription: ${status.subject}`,
        theme: "darkblue",
        native: true,
        duration: 15000,
      });
    }
  }, [lastMessage]);

  // const connectionStatus = {
  //   [ReadyState.CONNECTING]: "Connecting",
  //   [ReadyState.OPEN]: "Open",
  //   [ReadyState.CLOSING]: "Closing",
  //   [ReadyState.CLOSED]: "Closed",
  //   [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  // }[readyState];

  // useEffect(() => {
  //   console.log(connectionStatus);
  // });

  return (
    <Box bg="var(--background-color)" h="100vh">
      {user !== null && (
        <Box
          display="flex"
          maxW={{ sm: "750px", lg: "100%" }}
          margin={{ sm: "auto" }}
        >
          <Box flex={{ sm: "0", lg: "0.1" }}>
            <Sidebar onClose={onClose} isOpen={isOpen} />
          </Box>
          <Box
            flex={{ sm: "1", lg: "0.9" }}
            minH="100%"
            marginX="auto"
            h="100vh"
            overflow="auto"
            paddingX="5rem"
          >
            <Navbar onOpen={onOpen} />
            <main>
              <Route exact path="/dashboard" component={Home} />
              <Route exact path="/dashboard/incoming" component={Incoming} />
              <Route exact path="/dashboard/outgoing" component={Outgoing} />
              <Route
                path="/dashboard/add-document"
                component={CreateDocument}
              />
              <Route
                path={`/dashboard/:type/document/:id/`}
                component={ViewDocument}
              />
              <Route
                path={`/dashboard/copy/:type/document/:id/`}
                component={ViewDocumentCopy}
              />
              <ProtectedPage
                exact
                path="/dashboard/archive/"
                component={Archive}
              />

              <Route path="/dashboard/user-archive/" component={UserArchive} />

              <Route path="/dashboard/locator" component={Tracking} />

              <Route
                path="/dashboard/activate-document"
                component={ActivateDocument}
              />
              <Route
                path="/dashboard/activated-document"
                component={ActivatedDocView}
              />
              <Route
                exact
                path="/dashboard/archive/:slug"
                component={Directory}
              />
              <ProtectedPage path="/dashboard/create-flow" component={Flow} />
              {store.openTrackingModal && <TrackingDetail />}
            </main>
          </Box>
          {/* <Box
            position="fixed"
            right={{ sm: "60px", lg: "68px" }}
            bottom={{ sm: "10px", lg: "20px" }}
          >
            <Link to="/dashboard/add-document">
              <Image src={addIcon} boxSize="45px" />
            </Link>
          </Box> */}
        </Box>
      )}
    </Box>
  );
}

export default Dashboard;
