import React from "react";
import { fetchOutgoing } from "../../http/document";
import useFetchData from "../../hooks/useFetchData";
import Page from "../../components/Layout/Page";

function Outgoing() {
  const { loading, data } = useFetchData(fetchOutgoing);

  return <Page type="outgoing" data={data} loading={loading} />;
}

export default Outgoing;
