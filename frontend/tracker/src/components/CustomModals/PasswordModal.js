import { Button, Form, Input, Modal, notification } from "antd";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { encryptFile, encryptFolder } from "../../http/directory";
import { useStateValue } from "../../store/StateProvider";
import * as actionTypes from "../../store/actionTypes";

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
    offset: 4,
  },
};

function PasswordModal({ openModal, setOpenModal, data }) {
  const [form] = Form.useForm();
  const [store, dispatch] = useStateValue();
  const history = useHistory();
  const [submit, setSubmit] = useState(false);

  const handleCancel = () => {
    setOpenModal(false);
    form.resetFields();
  };

  const onFinish = async (values) => {
    setSubmit(true);
    const { type } = data;
    try {
      if (type === "folder") {
        const { name, slug } = data;
        const passwordData = { password: values.password };
        const res = await encryptFolder(store.token, slug, passwordData);
        if (res.status === 200) {
          setSubmit(false);
          dispatch({
            type: actionTypes.SET_BREADCRUMBS,
            payload: { name, slug },
          });
          history.push(`/dashboard/archive/${slug}`);
        } else {
          notification.error({
            message: "Error",
            description: "Wrong password",
          });
          setSubmit(false);
        }
      } else {
        const { document, setOpenPreview, setPreviewDoc } = data;
        const passwordData = { password: values.password };
        const res = await encryptFile(store.token, document.id, passwordData);
        if (res.status === 200) {
          handleCancel();
          setPreviewDoc(document);
          setOpenPreview(true);
          setSubmit(false);
        } else {
          notification.error({
            message: "Error",
            description: "Wrong password",
          });
          setSubmit(false);
        }
      }
    } catch (e) {
      notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
      setSubmit(false);
      form.resetFields();
    }
  };

  return (
    <>
      <Modal
        title="Enter Password"
        visible={openModal}
        onOk={form.submit}
        onCancel={handleCancel}
        style={{ top: 20 }}
        footer={[
          <Button
            type="primary"
            onClick={form.submit}
            loading={submit}
            key="footer"
          >
            {submit ? "Loading..." : "Open"}
          </Button>,
        ]}
      >
        <Form
          {...layout}
          form={form}
          name="complex-form"
          onFinish={onFinish}
          requiredMark={false}
        >
          <Form.Item
            label="Password"
            name="password"
            labelAlign="left"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              style={{
                borderColor: "var(--dark-brown)",
                outline: "none",
                transition: "all 0.5ms ease-in-out",
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default PasswordModal;
