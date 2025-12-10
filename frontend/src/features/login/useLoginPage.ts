import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { authAPI } from '../../services/api';

export const useLoginPage = () => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.BORGER);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const usernameCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);

  const validatePassword = (password: string): string | null => {
    if (!password) {
      return null;
    }
    if (password.length < 8) {
      return t('login.passwordMinLength');
    }
    if (!/[a-zA-Z]/.test(password)) {
      return t('login.passwordMustContainLetters');
    }
    if (!/[0-9]/.test(password)) {
      return t('login.passwordMustContainNumbers');
    }
    return null;
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string | null => {
    if (!confirmPassword) {
      return null;
    }
    if (confirmPassword !== password) {
      return t('login.passwordsDoNotMatch');
    }
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name) {
      return null;
    }
    const namePattern = /^[a-zA-ZæøåÆØÅ\s\-']+$/;
    if (!namePattern.test(name)) {
      return t('login.nameOnlyLetters');
    }
    return null;
  };

  const firstNameErrorDisplay = !isLogin && firstNameTouched ? validateName(firstName) : null;
  const lastNameErrorDisplay = !isLogin && lastNameTouched ? validateName(lastName) : null;
  const passwordError = !isLogin && passwordTouched ? validatePassword(password) : null;
  const confirmPasswordError = !isLogin && (confirmPasswordTouched || (confirmPassword && password)) 
    ? validateConfirmPassword(confirmPassword, password) 
    : null;

  // Check username availability with debouncing
  useEffect(() => {
    if (isLogin || !username.trim()) {
      setUsernameError(null);
      setUsernameAvailable(false);
      return;
    }

    if (usernameCheckTimeoutRef.current) {
      clearTimeout(usernameCheckTimeoutRef.current);
    }

    // Clear error and availability status while typing (before debounce)
    setUsernameError(null);
    setUsernameAvailable(false);

    if (usernameTouched || username.trim().length > 0) {
      setCheckingUsername(true);
      
      usernameCheckTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await authAPI.checkUsername(username.trim());
          if (response.exists) {
            setUsernameError(t('login.usernameExists'));
            setUsernameAvailable(false);
          } else {
            setUsernameError(null);
            setUsernameAvailable(true);
          }
        } catch (err) {
          setUsernameError(null);
          setUsernameAvailable(false);
        } finally {
          setCheckingUsername(false);
        }
      }, 500);
    }

    return () => {
      if (usernameCheckTimeoutRef.current) {
        clearTimeout(usernameCheckTimeoutRef.current);
      }
    };
  }, [username, usernameTouched, isLogin, t]);

  const handleSwitchToLogin = () => {
    setIsLogin(true);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setUsernameTouched(false);
    setUsernameError(null);
    setUsernameAvailable(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setError('');
  };

  const handleSwitchToRegister = () => {
    setIsLogin(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setUsernameTouched(false);
    setUsernameError(null);
    setUsernameAvailable(false);
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(username, password);
      } else {
        if (!firstName.trim() || !lastName.trim() || !username.trim()) {
          setError(t('login.allFieldsRequired'));
          setLoading(false);
          return;
        }

        if (usernameError) {
          setError(usernameError);
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError(t('login.passwordsDoNotMatch'));
          setLoading(false);
          return;
        }

        const passwordError = validatePassword(password);
        if (passwordError) {
          setError(passwordError);
          setLoading(false);
          return;
        }

        await register(username, firstName, lastName, password, confirmPassword, role);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  return {
    isLogin,
    username,
    setUsername,
    password,
    setPassword,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    confirmPassword,
    setConfirmPassword,
    role,
    setRole,
    error,
    loading,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordTouched,
    setPasswordTouched,
    confirmPasswordTouched,
    setConfirmPasswordTouched,
    usernameTouched,
    setUsernameTouched,
    usernameError,
    usernameAvailable,
    checkingUsername,
    firstNameTouched,
    setFirstNameTouched,
    lastNameTouched,
    setLastNameTouched,
    firstNameErrorDisplay,
    lastNameErrorDisplay,
    passwordError,
    confirmPasswordError,
    handleSwitchToLogin,
    handleSwitchToRegister,
    handleSubmit,
    setUsernameError,
    setUsernameAvailable,
  };
};

