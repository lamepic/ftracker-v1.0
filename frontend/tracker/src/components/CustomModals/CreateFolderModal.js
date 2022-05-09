import React, { useState } from "react";
import { Input, Form, notification, Switch, Button } from "antd";
import Modal from "antd/lib/modal/Modal";
import { createFolder } from "../../http/directory";
import { useStateValue } from "../../store/StateProvider";
import { Box } from "@chakra-ui/react";

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

function CreateFolderModal({
  setOpenCreateFolderModal,
  openCreateFolderModal,
  folderId,
  appendSubFolder,
  parentFolder,
  addFolder,
  setFolderCreated,
}) {
  const [form] = Form.useForm();
  const [store, dispatch] = useStateValue();
  const [encrypt, setEncrypt] = useState(false);
  const [submit, setSubmit] = useState(false);

  const handleCancel = () => {
    setOpenCreateFolderModal(false);
    form.resetFields();
  };

  function onSwitchChange(checked) {
    setEncrypt(!encrypt);
  }

  const onFinish = async (values) => {
    setSubmit(true);
    try {
      const res = await createFolder(store.token, {
        name: values.name,
        password: values.password,
        folderId,
      });

      if (res.status === 201) {
        setSubmit(false);
        if (addFolder) {
          // addFolder([...parentFolder, res.data]);
          setFolderCreated(true);
        } else {
          appendSubFolder({
            ...parentFolder,
            children: [...parentFolder?.children, res.data],
          });
        }
      }
    } catch (e) {
      setSubmit(false);
      form.resetFields();
      return notification.error({
        message: "Error",
        description: e.response.data.detail,
      });
    }
    setOpenCreateFolderModal(false);
  };

  return (
    <>
      <Modal
        title="New Folder"
        visible={openCreateFolderModal}
        onOk={form.submit}
        onCancel={handleCancel}
        style={{ top: 20 }}
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

            <Button type="primary" onClick={form.submit} loading={submit}>
              {submit ? "Creating..." : "Create"}
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
            name="name"
            label="Folder Name"
            rules={[
              {
                required: true,
                message: "Please input folder name!",
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

export default CreateFolderModal;
