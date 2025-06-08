import { ReactNode } from 'react';

interface TabButtonProps {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}

export default function TabButton({ children, active, onClick }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-lg transition-all duration-300 border-b-2 mx-2
        ${active 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
        }`}
    >
      {children}
    </button>
  );
}
