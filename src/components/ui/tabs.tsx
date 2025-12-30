'use client';

import * as React from 'react';

export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs = ({
  defaultValue,
  value,
  onValueChange,
  children,
  className = '',
}: TabsProps) => {
  const [selectedValue, setSelectedValue] = React.useState(defaultValue || '');

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <div className={className} data-value={value || selectedValue}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            selectedValue: value || selectedValue,
            onValueChange: handleChange,
          });
        }
        return child;
      })}
    </div>
  );
};

export const TabsList = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 ${className}`}
    >
      {children}
    </div>
  );
};

export const TabsTrigger = ({
  value,
  children,
  selectedValue,
  onValueChange,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  selectedValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}) => {
  const isSelected = value === selectedValue;

  return (
    <button
      type="button"
      onClick={() => onValueChange?.(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
        isSelected
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({
  value,
  children,
  selectedValue,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  selectedValue?: string;
  className?: string;
}) => {
  if (value !== selectedValue) return null;

  return <div className={`mt-2 ${className}`}>{children}</div>;
};
