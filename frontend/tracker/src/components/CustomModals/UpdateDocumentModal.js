import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import { Button, Form, Modal, notification, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadRules } from "../../utility/helper";
import { updateDocument } from "../../http/document";
import swal from "sweetalert";
import { useStateValue } from "../../store/StateProvider";

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

const dummyRequest = ({ file, onSuccess }) => {
  setTimeout(() => {
    onSuccess("fail");
  }, 0);
};

const getFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

function UpdateDocumentModal({
  openUpdateDocumentModal,
  setOpenUpdateDocumentModal,
  setDocumentUpdated,
  documentUpdated,
  document,
}) {
  const [submitting, setSubmitting] = useState();
  const [form] = Form.useForm();
  const [store, dispatch] = useStateValue();

  const handleCancel = () => {
    setOpenUpdateDocumentModal(false);
  };

  const onFinish = async (values) => {
    setSubmitting(true);

    const data = {
      document_id: document.id,
      file: values.document[0].originFileObj,
      filename: values.document[0].originFileObj.name,
    };

    try {
      const res = await updateDocument(store.token, data);
      if (res.status === 200) {
        setOpenUpdateDocumentModal(false);
        swal("Success!", "Document has been updated", "success");
        setDocumentUpdated(!documentUpdated);
      }
    } catch (err) {
      notification.error({
        mesage: "Error",
        description: err.data.detail,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        title="Upload File"
        visible={openUpdateDocumentModal}
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
                Update
              </Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default UpdateDocumentModal;
