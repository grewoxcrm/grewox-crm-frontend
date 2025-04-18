import React, { useEffect, useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Button,
    Typography,
    Divider,
    Select,
    DatePicker,
    InputNumber,
    Upload,
    Row,
    Col,
    Card,
    message,
    Spin
} from 'antd';
import {
    FiUser,
    FiBriefcase,
    FiDollarSign,
    FiCalendar,
    FiX,
    FiUpload,
    FiMail,
    FiFileText,
    FiMapPin
} from 'react-icons/fi';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
// import isValid from 'dayjs/plugin/isValid';
import TextArea from 'antd/es/input/TextArea';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import { useCreateOfferLetterMutation } from './services/offerLetterApi';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrBefore);
// dayjs.extend(isValid);

const { Text } = Typography;
const { Option } = Select;

const CreateOfferLetter = ({ open, onCancel, loading, initialValues }) => {
    const [form] = Form.useForm();
    const [createOfferLetter, { isLoading: createLoading }] = useCreateOfferLetterMutation();
    const [fileList, setFileList] = useState([]);

    const { data: jobApplications, isLoading: applicationsLoading } = useGetAllJobApplicationsQuery();
    const { data: jobs, isLoading: isLoadingJobs } = useGetAllJobsQuery();
    const { data: currencies, isLoading: currenciesLoading } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    useEffect(() => {
        if (currencies?.length && !initialValues) {
            const defaultCurrency = currencies.find(c => c.currencyCode === 'INR') || currencies[0];
            form.setFieldValue('currency', defaultCurrency.id);
        }
    }, [currencies, form, initialValues]);

    useEffect(() => {
        if (open) {
            form.resetFields();
            if (initialValues) {
                // Format the initial values for editing
                const formattedValues = {
                    ...initialValues,
                    startDate: initialValues.startDate ? dayjs(initialValues.startDate) : undefined,
                    endDate: initialValues.endDate ? dayjs(initialValues.endDate) : undefined,
                    skills: initialValues.skills?.Skills,
                    interviewRounds: initialValues.interviewRounds?.InterviewRounds,
                    title: initialValues.title,
                    category: initialValues.category,
                    location: initialValues.location,
                    totalOpenings: initialValues.totalOpenings,
                    status: initialValues.status,
                    recruiter: initialValues.recruiter,
                    jobType: initialValues.jobType || 'Full-time',
                    workExperience: initialValues.workExperience,
                    currency: initialValues.currency?.id || initialValues.currency,
                    expectedSalary: initialValues.expectedSalary,
                    description: initialValues.description
                };

                console.log(formattedValues);
                
                form.setFieldsValue(formattedValues);
            } else {
                // Set default values for new job
                const defaultCurrency = currencies?.find(c => c.currencyCode === 'INR') || currencies?.[0];
                form.setFieldsValue({
                    status: 'active',
                    jobType: 'Full-time',
                    currency: defaultCurrency?.id
                });
            }
        }
    }, [open, form, initialValues, currencies]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            // Create FormData instance
            const formData = new FormData();

            // Format dates and prepare payload
            const payload = {
                job: values.job,
                job_applicant: values.job_applicant,
                offer_expiry: dayjs(values.offer_expiry).format('YYYY-MM-DD'),
                expected_joining_date: dayjs(values.expected_joining_date).format('YYYY-MM-DD'),
                salary: parseFloat(values.salary),
                currency: values.currency,
                description: values.description,
                client_id: localStorage.getItem('client_id'),
                created_by: localStorage.getItem('user_id')
            };

            // Add file to formData if exists
            if (fileList?.[0]?.originFileObj) {
                formData.append('file', fileList[0].originFileObj);
            }

            // Add all other fields to formData
            Object.entries(payload).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            });

            const response = await createOfferLetter(formData).unwrap();

            if (response.success) {
                message.success('Offer letter created successfully');
                form.resetFields();
                setFileList([]);
                onCancel();
            } else {
                message.error(response.message || 'Failed to create offer letter');
            }
        } catch (error) {
            console.error('Error creating offer letter:', error);
            message.error(error?.data?.message || 'Failed to create offer letter');
        }
    };

    const validateDate = (_, value) => {
        if (!value) {
            return Promise.reject('Please select a date');
        }
        if (!dayjs.isDayjs(value)) {
            return Promise.reject('Invalid date format');
        }
        return Promise.resolve();
    };

    const handleFileChange = (info) => {
        setFileList(info.fileList.slice(-1));
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={720}
            destroyOnClose={true}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            style={{
                "--antd-arrow-background-color": "#ffffff",
            }}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: "8px",
                    overflow: "hidden",
                }
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                }}
            >
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        color: "#ffffff",
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                    }}
                >
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <FiBriefcase style={{ fontSize: "24px", color: "#ffffff" }} />
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                            }}
                        >
                            Create New Offer Letter
                        </h2>
                        <Text
                            style={{
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            Fill in the information to create offer letter
                        </Text>
                    </div>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                requiredMark={false}
                style={{ padding: "24px" }}
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Form.Item
                        name="job"
                        label={<span style={{ fontSize: '14px', fontWeight: '500' }}>Job <span style={{ color: '#ff4d4f' }}>*</span></span>}
                        rules={[{ required: true, message: 'Please select a job position' }]}
                    >
                        <Select
                            placeholder="Select job position"
                            loading={isLoadingJobs}
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                        >
                            {jobs?.data?.map((job) => (
                                <Option key={job.id} value={job.id}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FiBriefcase style={{ color: '#1890ff', fontSize: '16px', marginRight: '8px' }} />
                                        <span>{job.title}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="job_applicant"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Job Applicant <span style={{ color: '#ff4d4f' }}>*</span>
                            </span>
                        }
                        rules={[{ required: true, message: 'Please select an applicant' }]}
                    >
                        <Select
                            loading={applicationsLoading}
                            placeholder="Select applicant"
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                            }}
                            optionFilterProp="children"
                            showSearch
                            filterOption={(input, option) =>
                                option?.children?.props?.children[1]?.props?.children
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                            }
                        >
                            {jobApplications?.data?.map((application) => (
                                <Option key={application.id} value={application.id}>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <FiUser style={{ color: '#1890ff', fontSize: '16px', marginRight: '8px' }} />
                                        <span>{application.name}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="offer_expiry"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Offer Expire On <span style={{ color: '#ff4d4f' }}>*</span>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please select expiry date' },
                            { validator: validateDate }
                        ]}
                    >
                        <DatePicker
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            format="DD-MM-YYYY"
                            placeholder="Select expiry date"
                        />
                    </Form.Item>

                    <Form.Item
                        name="expected_joining_date"
                        label={
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                Expected Joining Date <span style={{ color: '#ff4d4f' }}>*</span>
                            </span>
                        }
                        rules={[
                            { required: true, message: 'Please select joining date' },
                            { validator: validateDate }
                        ]}
                    >
                        <DatePicker
                            size="large"
                            style={{
                                width: '100%',
                                borderRadius: '10px',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                border: '1px solid #e6e8eb',
                            }}
                            format="DD-MM-YYYY"
                            placeholder="Select joining date"
                        />
                    </Form.Item>

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="salary"
                            label={
                                <span style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                }}>
                                    Expected Salary <span style={{ color: '#ff4d4f' }}>*</span>
                                </span>
                            }
                            style={{ flex: 1 }}
                        >
                            <Input.Group compact className="price-input-group" style={{
                                display: 'flex',
                                height: '48px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '10px',
                                border: '1px solid #e6e8eb',
                                overflow: 'hidden',
                                marginBottom: 0
                            }}>
                                <Form.Item
                                    name="currency"
                                    noStyle
                                    rules={[{ required: true, message: 'Please select a currency' }]}
                                >
                                    <Select
                                        size="large"
                                        style={{
                                            width: '80px',
                                            height: '48px'
                                        }}
                                        loading={currenciesLoading}
                                        className="currency-select"
                                        defaultValue={currencies?.find(c => c.currencyCode === 'INR')?.id}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) => {
                                            const currency = currencies?.find(c => c.id === option.value);
                                            return currency?.currencyCode.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                                        }}
                                    >
                                        {currencies?.map(currency => (
                                            <Option 
                                                key={currency.id} 
                                                value={currency.id}
                                                selected={currency.currencyCode === 'INR'}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span>{currency.currencyIcon}</span>
                                                    <span>{currency.currencyCode}</span>
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                                <Form.Item
                                    name="salary"
                                    noStyle
                                    rules={[{ required: true, message: 'Please enter price' }]}
                                >
                                    <Input
                                        placeholder="Enter price"
                                        size="large"
                                        style={{
                                            flex: 1,
                                            width: '100%',
                                            border: 'none',
                                            borderLeft: '1px solid #e6e8eb',
                                            borderRadius: 0,
                                            height: '48px',
                                        }}
                                        className="price-input"
                                    />
                                </Form.Item>
                            </Input.Group>
                        </Form.Item>
                    </div>

                </div>

                <Form.Item
                    name="description"
                    label={
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            Description
                        </span>
                    }
                    rules={[{ required: true, message: 'Please enter description' }]}
                >
                    <TextArea
                        placeholder="Enter detailed description"
                        rows={4}
                        style={{
                            borderRadius: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e6e8eb',
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Form.Item>

                    <Form.Item
                        name="file"
                        label="Offer Letter Document"
                        rules={[{ required: true, message: 'Please upload offer letter document' }]}
                        className="full-width"
                    >
                        <Upload.Dragger
                            name="file"
                            multiple={false}
                            beforeUpload={() => false}
                            maxCount={1}
                            accept=".pdf,.doc,.docx"
                            fileList={fileList}
                            onChange={handleFileChange}
                        >
                            <p className="ant-upload-drag-icon">
                                <FiUpload style={{ fontSize: '24px', color: '#1890ff' }} />
                            </p>
                            <p className="ant-upload-text">Click or drag file to upload document</p>
                            <p className="ant-upload-hint">
                                Support for PDF, DOC, DOCX files
                            </p>
                        </Upload.Dragger>
                    </Form.Item>

                

                {/* <Divider style={{ margin: '24px 0' }} /> */}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '12px',
                        marginTop: '24px'
                    }}
                >
                    <Button
                        onClick={onCancel}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            border: '1px solid #e6e8eb',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading || createLoading}
                        size="large"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            height: '48px',
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                        }}
                    >
                        Create Offer Letter
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default CreateOfferLetter;