import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useLoginPage } from '../features/login/useLoginPage';
import LoginHeader from '../features/login/components/LoginHeader';
import LoginTabs from '../features/login/components/LoginTabs';
import LoginForm from '../features/login/components/LoginForm';
import RegisterForm from '../features/login/components/RegisterForm';
import './LoginPage.css';

const LoginPage = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  
  const {
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
  } = useLoginPage();

  return (
    <div className="login-page">
      <div className="login-container">
        <LoginHeader t={t} theme={theme} toggleTheme={toggleTheme} />
        
        <h1>{t('login.title')}</h1>
        
        <LoginTabs
          t={t}
          isLogin={isLogin}
          onSwitchToLogin={handleSwitchToLogin}
          onSwitchToRegister={handleSwitchToRegister}
        />

        <form onSubmit={handleSubmit} className="login-form">
          {isLogin ? (
            <LoginForm
              t={t}
              username={username}
              password={password}
              showPassword={showPassword}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
          ) : (
            <RegisterForm
              t={t}
              firstName={firstName}
              lastName={lastName}
              username={username}
              password={password}
              confirmPassword={confirmPassword}
              role={role}
              showPassword={showPassword}
              showConfirmPassword={showConfirmPassword}
              firstNameError={firstNameErrorDisplay}
              lastNameError={lastNameErrorDisplay}
              usernameError={usernameError}
              usernameAvailable={usernameAvailable}
              checkingUsername={checkingUsername}
              passwordError={passwordError}
              confirmPasswordError={confirmPasswordError}
              onFirstNameChange={setFirstName}
              onLastNameChange={setLastName}
              onUsernameChange={(value) => {
                setUsername(value);
                setUsernameTouched(true);
              }}
              onPasswordChange={(value) => {
                setPassword(value);
                if (confirmPasswordTouched) {
                  setConfirmPasswordTouched(false);
                }
              }}
              onConfirmPasswordChange={setConfirmPassword}
              onRoleChange={setRole}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
              onFirstNameBlur={() => setFirstNameTouched(true)}
              onLastNameBlur={() => setLastNameTouched(true)}
              onUsernameBlur={() => setUsernameTouched(true)}
              onPasswordBlur={() => setPasswordTouched(true)}
              onConfirmPasswordBlur={() => setConfirmPasswordTouched(true)}
              onFirstNameTouch={() => {
                if (!firstNameTouched) {
                  setFirstNameTouched(true);
                }
              }}
              onLastNameTouch={() => {
                if (!lastNameTouched) {
                  setLastNameTouched(true);
                }
              }}
              onUsernameTouch={() => {
                if (!usernameTouched) {
                  setUsernameTouched(true);
                }
              }}
              onPasswordTouch={() => setPasswordTouched(true)}
              onConfirmPasswordTouch={() => {
                if (!confirmPasswordTouched) {
                  setConfirmPasswordTouched(true);
                }
              }}
              onPasswordChangeReset={() => {
                if (confirmPasswordTouched) {
                  setConfirmPasswordTouched(false);
                }
              }}
            />
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? t('common.loading') : isLogin ? t('login.login') : t('login.register')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
