import React from "react";
import "./AttachmentModal.css";

import { Button, Form, Input, Modal, notification, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadRules } from "../../utility/helper";

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
    offset: 4,
  },
};

const validateMessages = {
  required: "This field is required!",
};

const getFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const dummyRequest = ({ file, onSuccess }) => {
  setTimeout(() => {
    onSuccess("fail");
  }, 0);
};

function AttachmentModal({
  getAttachments,
  attachments,
  openModal,
  setOpenModal,
}) {
  const [form] = Form.useForm();

  const handleCancel = () => {
    setOpenModal(false);
  };

  const onFinish = (values) => {
    if (!values.subject.trim().length > 0) {
      return notification.error({
        message: "Error",
        description: "Field cannot be blank",
      });
    }
    const new_attachment = {
      file: values.document[0].originFileObj,
      subject: values.subject,
    };
    const items = [...attachments, new_attachment];
    getAttachments(items);
    setOpenModal(false);
  };

  return (
    <>
      <Modal
        title="Add Attachment"
        visible={openModal}
        onOk={form.submit}
        onCancel={handleCancel}
      >
        <Form
          {...layout}
          form={form}
          name="complex-form"
          onFinish={onFinish}
          validateMessages={validateMessages}
          requiredMark={false}
        >
          <Form.Item
            labelAlign="left"
            name="subject"
            label="Subject"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input
              style={{
                borderColor: "var(--dark-brown)",
                outline: "none",
              }}
            />
          </Form.Item>
          <Form.Item
            labelAlign="left"
            name="document"
            label="Document"
            // wrapperCol={{ ...layout.labelCol, offset: 9 }}
            getValueFromEvent={getFile}
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Upload maxCount={1} customRequest={dummyRequest} {...uploadRules}>
              <Button icon={<UploadOutlined />} style={{ width: "275px" }}>
                Upload
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default AttachmentModal;
