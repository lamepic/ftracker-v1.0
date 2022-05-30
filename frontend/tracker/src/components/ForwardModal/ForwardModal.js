import React, { useEffect, useState } from "react";
import "./ForwardModal.css";
import { useHistory } from "react-router-dom";

import { useStateValue } from "../../store/StateProvider";
import { departments, loadUsers } from "../../http/user";
import { forwardDocument, forwardDocumentCopy } from "../../http/document";
import swal from "sweetalert";
import Modal from "antd/lib/modal/Modal";
import { CircularProgress } from "@chakra-ui/react";
import { Select, Form, notification } from "antd";

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
    offset: 4,
  },
};

const openNotificationWithIcon = (type, description) => {
  notification[type]({
    message: "Error",
    description,
  });
};

const validateMessages = {
  required: "This field is required!",
};

function ForwardModal({ document, openModal, setOpenModal, type }) {
  const [store, dispatch] = useStateValue();
  const history = useHistory();
  const [_departments, setDepartments] = useState([]);
  const [users, setUsers] = useState([]);
  const [namesOfUsers, setNamesOfUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchDepartments();
    fetchUsers();
    setLoading(false);
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await departments(store.token);
      setDepartments(res.data);
    } catch (error) {
      openNotificationWithIcon("error", error.response.data.detail);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await loadUsers(store.token);
      setUsers(res.data);
    } catch (error) {
      openNotificationWithIcon("error", error.response.data.detail);
    }
  };

  const departmentOptions = _departments.map((department) => ({
    value: department.id,
    label: department.name,
  }));

  const onDepartmentChange = (value) => {
    const _namesOfUsers = users
      .filter(
        (user) =>
          user.staff_id !== store.user.staff_id && user.department?.id === value
      )
      .map((user) => {
        const { first_name, last_name, staff_id } = user;
        const name = `${first_name} ${last_name}`;
        return { staff_id, name };
      });
    setNamesOfUsers(_namesOfUsers);
  };

  const handleCancel = () => {
    setOpenModal(false);
    setNamesOfUsers([]);
  };

  const handleSubmit = (values) => {
    const receiver_name = users.find(
      (user) => user.staff_id === values.receiver
    );
    const data = { receiver: values.receiver, document: document };
    swal({
      title: `Are you sure you want to Forward this Document to ${receiver_name.first_name} ${receiver_name.last_name}?`,
      text: "Forwarding of this Document is irreversible",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then(async (willSubmit) => {
      if (willSubmit) {
        try {
          if (type !== "copy") {
            const res = await forwardDocument(store.token, data);
            if (res.status === 201) {
              setOpenModal(false);
              history.replace("/dashboard/outgoing");
              swal("Document has been sent succesfully", {
                icon: "success",
              });
            }
          } else {
            const res = await forwardDocumentCopy(store.token, data);
            if (res.status === 201) {
              setOpenModal(false);
              // history.replace("/dashboard/outgoing");
              swal("Document has been sent succesfully", {
                icon: "success",
              });
            }
          }
        } catch (error) {
          notification.error({
            message: "Error",
            description: error.response.data.detail,
          });
        }
      }
    });
  };

  return (
    <div className="forwardModal">
      {!loading ? (
        <Modal
          title="Forward Document"
          visible={openModal}
          onOk={form.submit}
          onCancel={handleCancel}
        >
          <Form
            {...layout}
            name="complex-form"
            onFinish={handleSubmit}
            validateMessages={validateMessages}
            requiredMark={false}
            form={form}
          >
            <Form.Item
              labelAlign="left"
              name="department"
              label="Department"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select Department"
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                onChange={onDepartmentChange}
              >
                {departmentOptions.map((department) => (
                  <Select.Option
                    value={department.value}
                    key={department.value}
                  >
                    {department.label}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              labelAlign="left"
              name="receiver"
              label="To"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                placeholder="Select Employee"
                optionFilterProp="children"
              >
                {namesOfUsers &&
                  namesOfUsers.map((receiver) => (
                    <Select.Option
                      value={receiver.staff_id}
                      key={receiver.staff_id}
                    >
                      {receiver.name}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      ) : (
        <CircularProgress />
      )}
    </div>
  );
}

export default ForwardModal;
