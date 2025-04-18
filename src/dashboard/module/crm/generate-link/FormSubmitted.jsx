import React from 'react';
import { Result } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import './FormSubmitted.scss';

const FormSubmitted = () => {
    return (
        <div className="form-submitted-page">
            <div className="form-submitted-container">
                <Result
                    icon={<CheckCircleFilled className="success-icon" />}
                    title="Thank You!"
                    subTitle="Your form has been submitted successfully"
                />
                <div className="success-message">
                    <p>We have received your information and will get back to you soon.</p>
                </div>
            </div>
        </div>
    );
};

export default FormSubmitted; 