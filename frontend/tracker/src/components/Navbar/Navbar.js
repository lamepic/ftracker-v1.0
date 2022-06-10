import { Box, CircularProgress, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import "./Navbar.css";
import Search from "../Input/Search";
import { BellFilled, DownOutlined, MenuOutlined } from "@ant-design/icons";
import { useStateValue } from "../../store/StateProvider";
import { logout } from "../../http/auth";
import * as actionTypes from "../../store/actionTypes";
import { useHistory } from "react-router-dom";
import {
  fetchActivateDocument,
  fetchRequest,
  notificationsCount,
} from "../../http/document";
import { Menu, Dropdown, notification } from "antd";
import CustomBadge from "../Badge/CustomBadge";
import moment from "moment";
import { auth_axios } from "../../utility/axios";

const MenuDropDown = ({ userInfo, handleLogout }) => {
  const menu = (
    <Menu>
      <Menu.Item key="000" onClick={handleLogout}>
        <Text color="var(--light-brown)" fontWeight="400" fontSize="16px">
          Logout
        </Text>
      </Menu.Item>
    </Menu>
  );

  return (
    <Box _hover={{ cursor: "pointer" }}>
      <Dropdown overlay={menu} trigger={["click"]} placement="bottomRight">
        <span
          className="ant-dropdown-link"
          onClick={(e) => e.preventDefault()}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            isTruncated
            fontSize="1.1rem"
            color="#9D4D01"
            fontWeight="600"
            maxW="150px"
          >
            {userInfo.first_name} {userInfo.last_name}
          </Text>{" "}
          <DownOutlined
            style={{
              fontSize: "0.8rem",
              color: "#9D4D01",
              fontWeight: "600",
              marginLeft: "2px",
            }}
          />
        </span>
      </Dropdown>
    </Box>
  );
};

function NotificationDropDown() {
  const history = useHistory();
  const [store, dispatch] = useStateValue();
  const [pendingRequest, setPendingRequest] = useState([]);
  const [activatedDocuments, setActivatedDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleClick = (event) => {
    fetchNotifications();
    fetchPendingRequest();
  };

  const fetchPendingRequest = async () => {
    try {
      const requestRes = await fetchRequest(store.token);
      const requestData = requestRes.data;
      setPendingRequest(requestData);
      const activatedDocumentRes = await fetchActivateDocument(store.token);
      const activatedDocumentData = activatedDocumentRes.data;
      setActivatedDocuments(activatedDocumentData);
    } catch (err) {
      notification.error({
        message: "Error",
        description: err.data.details,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    const res = await notificationsCount(store.token);
    const data = res.data;
    dispatch({
      type: actionTypes.SET_NOTIFICATIONS_COUNT,
      payload: data.count,
    });
  };

  const handleRequest = (details) => {
    dispatch({
      type: actionTypes.SET_REQUEST_DETAILS,
      payload: details,
    });
    history.push("/dashboard/activate-document");
  };

  const handleOpenActivatedDoc = (details) => {
    dispatch({
      type: actionTypes.SET_ACTIVATED_DOCUMENTS_DETAILS,
      payload: details,
    });
    history.push("/dashboard/activated-document");
  };

  const menu = (
    <Menu>
      <Menu.Item key="0101">
        <div className="request__header" key="00">
          <BellFilled
            style={{
              fontSize: "22px",
              color: "var(--dark-brown)",
              pointerEvents: "none",
            }}
          />
          <p>Notifications</p>
        </div>
      </Menu.Item>
      {!loading ? (
        pendingRequest.map((request) => {
          const id = request.id;
          const name = `${request.requested_by.first_name} ${request.requested_by.last_name}`;
          const document = request.document.subject;
          const department = request.requested_by.department.name;
          const date = new Date(request.created_at);
          return (
            <Menu.Item onClick={() => handleRequest(request)} key={id}>
              <div className="request">
                <div className="request__content">
                  <div className="request_from">
                    <Text
                      color="var(--dark-brown)"
                      fontWeight="600"
                      fontSize="15px"
                      isTruncated
                      width="150px"
                    >
                      {name}
                    </Text>
                  </div>
                  <p className="request_department">{department}</p>
                  <p className="document__name">{document}</p>
                </div>
                <p className="request__date">{moment(date).fromNow()}</p>
              </div>
            </Menu.Item>
          );
        })
      ) : (
        <Menu.Item key="01">
          <div className="notification__loading">
            <CircularProgress color="inherit" />
          </div>
        </Menu.Item>
      )}
      {activatedDocuments.map((doc) => {
        const id = doc.id;
        const name = `${doc.sender.first_name} ${doc.sender.last_name}`;
        const document = doc.document.subject;
        const date = new Date(doc.date_activated);
        const read = doc.read;

        return (
          <Menu.Item onClick={() => handleOpenActivatedDoc(doc)} key={id}>
            <div
              className="request"
              style={{
                background: `${!read ? "#d9d9d9" : ""}`,
              }}
            >
              <Box padding="5px">
                <div className="request__content">
                  <div className="request_from">
                    <Text
                      color="var(--dark-brown)"
                      fontWeight="600"
                      fontSize="15px"
                      isTruncated
                      width="150px"
                    >
                      {name}
                    </Text>
                  </div>
                  <p className="activate__msg">Document request granted</p>
                  <p className="activate__document__name">{document}</p>
                </div>
                <p className="request__date">{moment(date).fromNow()}</p>
              </Box>
            </div>
          </Menu.Item>
        );
      })}
      {!loading &&
        pendingRequest.length === 0 &&
        activatedDocuments.length === 0 && (
          <Menu.Item key="001">
            <div className="request">
              <p className="empty__request">You have 0 Notifications</p>
            </div>
          </Menu.Item>
        )}
    </Menu>
  );

  return (
    <Box onClick={handleClick} position="relative" width="fit-content">
      {store.notificationsCount > 0 && (
        <CustomBadge
          count={store.notificationsCount}
          size="20px"
          position={{ top: "-5px", right: "-5px" }}
        />
      )}
      <Dropdown
        overlay={menu}
        trigger={["click"]}
        placement="bottomCenter"
        arrow
      >
        <BellFilled style={{ fontSize: "30px", color: "var(--dark-brown)" }} />
      </Dropdown>
    </Box>
  );
}

const getDay = () => {
  const event = new Date();
  const options = { weekday: "long" };
  return event.toLocaleDateString("en-US", options);
};

const getMonth = () => {
  const event = new Date();
  const options = { month: "long" };
  return event.toLocaleDateString("en-US", options);
};

function Navbar({ onOpen }) {
  const [store, dispatch] = useStateValue();

  const userInfo = store.user;

  const handleLogout = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Token ${store.token}`,
        },
      };
      const res = await auth_axios.post("/token/logout/", store.token, config);
      if (res.status === 204) {
        dispatch({
          type: actionTypes.LOGOUT_SUCCESS,
        });
      }
    } catch (error) {
      return notification.error({
        message: "Error",
        description: error.request,
      });
    }
  };
  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      marginTop="20px"
    >
      <Box display={{ md: "block", lg: "none" }}>
        <MenuOutlined
          onClick={onOpen}
          style={{ fontSize: "22px", color: "var(--dark-brown)" }}
        />
      </Box>
      <Box flex="0.2" marginLeft={{ md: "15px", lg: "0" }}>
        <Heading as="h2" fontSize={{ sm: "1rem", lg: "1.2rem" }}>
          Dashboard
        </Heading>
        <Heading
          as="h3"
          fontSize={{ sm: "0.6rem", lg: "0.8rem" }}
          color="var(--dark-brown)"
        >
          {getDay()}{" "}
          <Text
            color="var(--light-brown)"
            display="inline"
            fontWeight="600"
          >{`${new Date().getDate()} ${getMonth()} ${new Date().getFullYear()}`}</Text>
        </Heading>
      </Box>
      <Box flex="0.5">
        <Search />
      </Box>
      <Box _hover={{ cursor: "pointer" }} flex="0.1">
        <NotificationDropDown />
      </Box>
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        flex={{ sm: "0.2", lg: "0" }}
      >
        <Text
          className="initials"
          display="inline"
          bg="var(--lighter-brown)"
          padding="5px 8px"
          borderRadius="5px"
          textTransform="uppercase"
          color="var(--dark-brown)"
          fontWeight="600"
          fontSize="17px"
        >{`${userInfo.first_name[0]}${userInfo.last_name[0]}`}</Text>
        <MenuDropDown userInfo={userInfo} handleLogout={handleLogout} />
      </Box>
    </Box>
  );
}

export default Navbar;
