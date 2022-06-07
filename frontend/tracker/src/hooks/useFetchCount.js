import { useEffect } from "react";
import { useStateValue } from "../store/StateProvider";
import * as actionTypes from "../store/actionTypes";
import {
  fetchArchiveCount,
  fetchIncomingCount,
  fetchOutgoingCount,
  notificationsCount,
} from "../http/document";
import { notification } from "antd";

function useFetchCount(incoming, outgoing, archive, notifications) {
  const [store, dispatch] = useStateValue();

  useEffect(() => {
    if (incoming) fetchIncoming();
    if (outgoing) fetchOutgoing();
    if (archive) fetchArchive();
    if (notifications) fetchNotifications();
  }, [store.newIncoming]);

  const fetchIncoming = async () => {
    try {
      const res = await fetchIncomingCount(store.token);
      const data = res.data.count;
      dispatch({
        type: actionTypes.SET_INCOMING_COUNT,
        payload: data,
      });
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const fetchArchive = async () => {
    try {
      const res = await fetchArchiveCount(store.token);
      const data = res.data.count;
      dispatch({
        type: actionTypes.SET_ARCHIVE_COUNT,
        payload: data,
      });
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const fetchOutgoing = async () => {
    try {
      const res = await fetchOutgoingCount(store.token);
      const data = res.data.count;
      dispatch({
        type: actionTypes.SET_OUTGOING_COUNT,
        payload: data,
      });
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationsCount(store.token);
      const data = res.data;
      dispatch({
        type: actionTypes.SET_NOTIFICATIONS_COUNT,
        payload: data.count,
      });
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
  };
}

export default useFetchCount;
