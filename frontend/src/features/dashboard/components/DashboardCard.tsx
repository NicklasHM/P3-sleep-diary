import React from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  buttonText,
  onClick,
  disabled = false,
  children,
}) => {
  return (
    <div
      className="card dashboard-card"
      onClick={!disabled ? onClick : undefined}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.7 : 1,
      }}
    >
      <h2>{title}</h2>
      <p>{description}</p>
      {children}
      {buttonText && !disabled && (
        <button className="btn btn-primary">{buttonText}</button>
      )}
    </div>
  );
};

export default DashboardCard;








