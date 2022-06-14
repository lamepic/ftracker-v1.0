import React, { useCallback, useEffect, useState } from "react";
import "./Search.css";
import { Box, Text } from "@chakra-ui/react";
import { AutoComplete, Button, Input, notification } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useStateValue } from "../../store/StateProvider";
import { SearchDocument, requestDocument } from "../../http/document";
import * as actionTypes from "../../store/actionTypes";
import { useHistory } from "react-router-dom";
import swal from "sweetalert";
import { Empty } from "antd";

const searchResult = (
  query,
  handleTrack,
  handleRequest,
  handleView,
  handleOpenActivatedDoc,
  store
) => {
  if (query.length === 0) {
    return new Array(query.length)
      .join(".")
      .split(".")
      .map((_, idx) => {
        const category = "No Document Found";
        return {
          value: category,
          label: (
            <div>
              <span>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </span>
            </div>
          ),
        };
      });
  }

  return query.map((item, idx) => {
    return {
      label: (
        <div className="search__item" key={idx}>
          <div className="item__description">
            <p className="item__title">{item.document.subject}</p>
            {/* <p className="item__ref">{item.document.ref}</p> */}
            <Text className="item__ref" isTruncated={true}>
              {item.document.filename}
            </Text>
          </div>
          <div className="item__action">
            {item.route === "outgoing" && (
              <Button
                size="middle"
                className="search__btn"
                onClick={() => handleTrack(item.document.id)}
                type="text"
              >
                Track
              </Button>
            )}
            {(item.route === "outgoing" || item.route === "incoming") && (
              <Button
                size="middle"
                className="search__btn"
                onClick={() => handleView(item.route, item.document.id)}
                type="text"
              >
                View
              </Button>
            )}
            {item.route === "activated" && (
              <Button
                size="middle"
                className="search__btn"
                onClick={() => handleOpenActivatedDoc(item)}
                type="text"
              >
                View
              </Button>
            )}
            {item.route === "archive" &&
              item.department === store.user.department.name &&
              store.user.is_department && (
                <Button
                  size="middle"
                  className="search__btn"
                  onClick={() => handleView(item.route, item.document.id)}
                  type="text"
                >
                  View
                </Button>
              )}
            {item.route === "archive" &&
              // store.user.is_department !== true &&
              item.department !== store.user.department.name && (
                <Button
                  size="middle"
                  className="search__btn"
                  onClick={() => handleRequest(item.document)}
                  type="text"
                >
                  Request
                </Button>
              )}
            {item.route === "archive" &&
              !store.user.is_department &&
              item.department === store.user.department.name && (
                <Button
                  size="middle"
                  className="search__btn"
                  onClick={() => handleRequest(item.document)}
                  type="text"
                >
                  Request
                </Button>
              )}
            {item.route === "pending" && (
              <Button size="middle" className="search__btn" disabled>
                Pending
              </Button>
            )}
          </div>
        </div>
      ),
    };
  });
};

const loadingSearch = (loading) => {
  if (loading) {
    return {
      label: <Box>Loading...</Box>,
    };
  }
};

function Search() {
  const [store, dispatch] = useStateValue();
  const [options, setOptions] = useState([]);
  const [term, setTerm] = useState("");
  const [debouncedTerm, setDebouncedTerm] = useState(term);
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTerm(debouncedTerm), 500);
    return () => clearTimeout(timer);
  }, [debouncedTerm]);

  useEffect(() => {
    if (term !== "") {
      _search(term);
    }
  }, [term]);

  const _search = useCallback(async (term) => {
    setLoading(true);
    try {
      const res = await SearchDocument(store.token, term);
      loadingSearch(loading);
      const data = res.data;
      setOptions(
        data
          ? searchResult(
              data,
              handleTrack,
              handleRequest,
              handleView,
              handleOpenActivatedDoc,
              store
            )
          : []
      );
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.data.details,
      });
    } finally {
      setLoading(false);
    }
  });

  const handleSearch = async (value) => {
    setDebouncedTerm(value);
  };

  const handleTrack = (id) => {
    dispatch({
      type: actionTypes.SET_TRACKING_DOC_ID,
      payload: id,
    });
    dispatch({
      type: actionTypes.SET_OPEN_TRACKING_MODAL,
      payload: true,
    });
    setTerm("");
  };

  const handleView = (route, id) => {
    history.push(`/dashboard/${route}/document/${id}/`);
    setTerm("");
  };

  const handleRequest = async (document) => {
    const data = {
      document_id: document.id,
    };
    swal({
      title: "Request this Document?",
      text: `${document.subject} - ${document.ref}`,
      icon: "warning",
      button: {
        text: "Ok",
        closeModal: false,
      },
      dangerMode: true,
    }).then(async (willSubmit) => {
      if (willSubmit) {
        const res = await requestDocument(store.token, data);
        if (res.status === 201) {
          swal("Your Request for the document has been sent", {
            icon: "success",
          });
          history.push("/dashboard/");
        }
        if (res.status === 200) {
          swal({
            title: "Request Pending",
            text: res.data.msg,
            icon: "warning",
          });
          history.push("/dashboard/");
        }
      }
    });
  };

  const handleOpenActivatedDoc = (details) => {
    dispatch({
      type: actionTypes.SET_ACTIVATED_DOCUMENTS_DETAILS,
      payload: details,
    });
    history.push("/dashboard/activated-document");
  };

  return (
    <Box overflow="hidden">
      <AutoComplete
        dropdownMatchSelectWidth={252}
        style={{
          width: "100%",
          overflow: "hidden",
          borderRadius: "20px",
          border: "none",
          outline: "none",
        }}
        options={options}
        // onSelect={onSelect}
        onSearch={handleSearch}
      >
        <Input
          size="large"
          placeholder="Search files and documents"
          style={{
            // borderRadius: "20px",
            border: "none",
            outline: "none",
          }}
          prefix={
            <SearchOutlined
              style={{ paddingRight: "15px", paddingLeft: "5px" }}
            />
          }
        />
      </AutoComplete>
    </Box>
  );
}

export default Search;
