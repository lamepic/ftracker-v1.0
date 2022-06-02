import React from "react";
import Page from "../../components/Layout/Page";
import { fetchActivateDocument, fetchIncoming } from "../../http/document";
import useFetchData from "../../hooks/useFetchData";

function Incoming() {
  const { loading, data } = useFetchData(fetchIncoming);

  return <Page type="incoming" data={data} loading={loading} />;
}

export default Incoming;
