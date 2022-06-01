import { UploadOutlined } from "@ant-design/icons";
import { Button, Form, Input, notification, Switch, Upload } from "antd";
import Modal from "antd/lib/modal/Modal";
import React, { useRef, useState } from "react";
import { createFile } from "../../http/directory";
import { useStateValue } from "../../store/StateProvider";
import { Box } from "@chakra-ui/react";
import { uploadRules } from "../../utility/helper";

const validateMessages = {
  required: "This field is required!",
};

const layout = {
  labelCol: {
    span: 6,
  },
  wrapperCol: {
    span: 16,
    offset: 4,
  },
};

const dummyRequest = ({ file, onSuccess }) => {
  setTimeout(() => {
    onSuccess("ok");
  }, 0);
};

const getFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

function CreateFileModal({
  setOpenCreateFileModal,
  openCreateFileModal,
  folderId,
  appendFile,
  parentFolder,
  submitting,
  setSubmitting,
  appendFileToArchive,
}) {
  const [form] = Form.useForm();
  const [store, dispatch] = useStateValue();
  const [encrypt, setEncrypt] = useState(false);

  const handleCancel = () => {
    setOpenCreateFileModal(false);
  };

  function onSwitchChange(checked) {
    setEncrypt(!encrypt);
  }

  const onFinish = async (values) => {
    setSubmitting(true);
    const data = {
      subject: values.subject,
      file: values.document[0].originFileObj,
      reference: values.reference,
      parentFolderId: folderId,
      filename: values.document[0].originFileObj.name,
      password: values.password,
    };

    try {
      const res = await createFile(store.token, data);
      if (res.status === 201) {
        setSubmitting(false);
        if (appendFileToArchive) {
          appendFileToArchive([...parentFolder, res.data]);
        } else {
          appendFile({
            ...parentFolder,
            documents: [...parentFolder?.documents, res.data],
          });
        }
      }
    } catch (e) {
      setSubmitting(false);
      return notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
    setOpenCreateFileModal(false);
  };
  return (
    <>
      <Modal
        title="Upload File"
        visible={openCreateFileModal}
        onCancel={handleCancel}
        style={{ top: 20 }}
        confirmLoading={submitting}
        footer={[
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            key="footer"
          >
            <Switch
              onChange={onSwitchChange}
              style={{
                display: "inline",
              }}
            />
            <Button
              type="primary"
              onClick={form.submit}
              loading={submitting}
              key="footer"
            >
              {submitting ? "Uploading..." : "Upload"}
            </Button>
          </Box>,
        ]}
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
            name="reference"
            label="Reference"
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
            label="File"
            wrapperCol={{ ...layout.wrapperCol }}
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
          {encrypt && (
            <Form.Item
              label="Password"
              name="password"
              labelAlign="left"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                style={{
                  borderColor: "var(--dark-brown)",
                  outline: "none",
                  transition: "all 0.5ms ease-in-out",
                }}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  );
}

export default CreateFileModal;
