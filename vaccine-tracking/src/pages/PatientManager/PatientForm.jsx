import React from 'react';
import { Form, Input, DatePicker } from 'antd';
import moment from 'moment';

const PatientForm = ({ form, initialValues, isEditing }) => {
  React.useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        dob: initialValues.dob ? moment(initialValues.dob, 'YYYY-MM-DD') : null,
      });
    }
  }, [initialValues, form]);

  return (
    <div className="patient-form-container">
      <Form form={form} layout="vertical">
        <Form.Item
          name="patientName"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="dob"
          label="Ngày sinh"
          rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item name="gender" label="Giới tính">
          <Input />
        </Form.Item>
        <Form.Item name="guardianPhone" label="Số điện thoại người thân">
          <Input />
        </Form.Item>
        <Form.Item name="address" label="Địa chỉ">
          <Input />
        </Form.Item>
        <Form.Item name="relationshipToAccount" label="Mối quan hệ">
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="Số điện thoại">
          <Input />
        </Form.Item>
      </Form>
    </div>
  );
};

export default PatientForm;