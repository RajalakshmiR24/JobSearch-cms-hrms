import  { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Auth = () => {
  const navigate = useNavigate();
  const callRef = useRef(0);

  const handleNavigate = useCallback((role) => {
    const roleRoutes = {
      hr: '/cms/hr',
      candidate: '/cms/candidate',
      superAdmin: '/cms/superadmin',
    };
    navigate(roleRoutes[role] || '/cms');
  }, [navigate]);

  useEffect(() => {
    if (callRef.current === 1) return;
    callRef.current = 1;

    const fetchUser = async () => {
      try {
        const url = `${process.env.REACT_APP_CMS_SERVER}/api/cms/auth/login/success`;
        const { data } = await axios.get(url, { withCredentials: true });

        const { cmshrmstoken, role } = data;

        if (cmshrmstoken) {
          localStorage.setItem('cmshrmstoken', cmshrmstoken);
        }

        handleNavigate(role);
      } catch (err) {
        console.error('Login success error:', err.response?.data || err.message);
        navigate('/cms');
      }
    };

    fetchUser();
  }, [handleNavigate, navigate]);

  return null; // No UI needed
};

export default Auth;
