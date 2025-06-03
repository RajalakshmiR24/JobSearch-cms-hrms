import React, { useState } from 'react';
import axiosInstance from '../../../utils/axiosInstance';
import { validateOrganizationForm } from '../../../utils/validation';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginWithGoogle } from '../../../redux/authSlice'; 

const Organization_Form = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    organization_name: '',
    organization_address: '',
    organization_contact: { email: '' },
    organization_website: '',
    organization_logo: '',
  });

  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const dispatch = useDispatch(); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nameParts = name.split('.');

    if (nameParts.length > 1) {
      setFormData((prevState) => ({
        ...prevState,
        [nameParts[0]]: {
          ...prevState[nameParts[0]],
          [nameParts[1]]: value,
        },
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, organization_logo: 'Only image files are allowed (jpeg, jpg, png, svg, webp, gif).' }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, organization_logo: reader.result }));
      setFormErrors(prev => ({ ...prev, organization_logo: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleCreateHR = async (e) => {
    e.preventDefault();
    const errors = validateOrganizationForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const response = await axiosInstance.post('/api/cms/auth/create/org', formData);

      if (response.data.code === 400) {
        setCreateError(response.data.message);
        setCreateSuccess('');
      } else if (response.status === 201) {
        setCreateSuccess('HR details created successfully!');
        setCreateError('');
        setFormData({
          name: '',
          email: '',
          phone_number: '',
          organization_name: '',
          organization_address: '',
          organization_contact: { email: '' },
          organization_website: '',
          organization_logo: '',
        });
        navigate('/cms/org');
        dispatch(loginWithGoogle()); 
      }
    } catch (err) {
      setCreateError('Error occurred while creating HR. Please try again later.');
      setCreateSuccess('');
    }
  };

  return (
    <div className="rounded-lg max-w-4xl w-full mx-auto bg-white font-sans">
      <h3 className="text-xl font-semibold mt-8 mb-4 text-center">Organization & Admin Data Entry</h3>
      {createSuccess && <p className="text-green-500 font-semibold mb-4">{createSuccess}</p>}
      {createError && <p className="text-red-500 font-semibold mb-4">{createError}</p>}
      <form autoComplete="off" onSubmit={handleCreateHR}>
        <div className="flex gap-10">
          <div className="w-1/2">
            <h4 className="text-lg font-semibold mb-4">Organization Details</h4>
            {[ 
              { label: 'Organization Name', name: 'organization_name', type: 'text', placeholder: 'Enter Organization Name (e.g., xyz)' },
              { label: 'Organization Address', name: 'organization_address', type: 'text', placeholder: 'Enter Organization Address (e.g., xyz)' },
              { label: 'Organization Contact Email', name: 'organization_contact.email', type: 'email', placeholder: 'Enter Organization Email (e.g., xyz@example.com)' },
              { label: 'Organization Website', name: 'organization_website', type: 'text', placeholder: 'Enter Organization Website (Optional, e.g., xyz.com)' },
            ].map(({ label, name, type, placeholder }) => (
              <div className="mb-5" key={name}>
                <label className="block text-sm font-medium">
                  {label} <span className={name !== 'organization_website' ? 'text-red-500' : ''}>*</span>
                </label>
                <input
                  type={type}
                  name={name}
                  value={name.includes('organization_contact') ? formData.organization_contact[name.split('.')[1]] : formData[name]}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  required={name !== 'organization_website'}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:outline-none"
                />
                {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
              </div>
            ))}
            <div className="mb-5">
              <label className="block text-sm font-medium">Organization Logo <span className="text-red-500">*</span></label>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:outline-none" />
              {formErrors.organization_logo && <p className="text-red-500 text-xs mt-1">{formErrors.organization_logo}</p>}
            </div>
          </div>

          <div className="w-1/2">
            <h4 className="text-lg font-semibold mb-4">Admin Details</h4>
            {[ 
              { label: 'Name', name: 'name', type: 'text', placeholder: 'Enter Admin Name (e.g., xyz)' },
              { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter Admin Email (e.g., xyz@example.com)' },
              { label: 'Phone Number', name: 'phone_number', type: 'text', placeholder: 'Enter Admin Phone Number (e.g., 9876554321)' },
            ].map(({ label, name, type, placeholder }) => (
              <div className="mb-5" key={name}>
                <label className="block text-sm font-medium">{label} <span className="text-red-500">*</span></label>
                <input
                  type={type}
                  name={name}
                  value={formData[name]}
                  onChange={handleInputChange}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm focus:border-blue-500 focus:outline-none"
                />
                {formErrors[name] && <p className="text-red-500 text-xs mt-1">{formErrors[name]}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-5 mt-8">
          <button type="submit" className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition duration-300 hover:bg-blue-600">
            Create
          </button>
          <button type="button" onClick={() => navigate('/cms/org')} className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer transition duration-300 hover:bg-gray-600">
            Close
          </button>
        </div>
      </form>
    </div>
  );
};

export default Organization_Form;
