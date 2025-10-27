import React from 'react';
import { useTheme } from './ThemeProvider'; // CORRECTED: This now points correctly to the local file

// Placeholder for a styled Select component (replace with your actual UI Select)
const StyledSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={`
      ${className || ''} 
      bg-card text-foreground border border-border rounded-lg px-4 py-2 
      shadow-md appearance-none outline-none transition duration-200
      focus:ring-2 focus:ring-primary focus:border-primary w-full
      font-sans
    `}
    {...props}
  />
));
StyledSelect.displayName = 'StyledSelect';


export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // The value will be 'light', 'dark', or 'system'
    setTheme(event.target.value as 'light' | 'dark' | 'system');
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-2 bg-card/50 rounded-xl">
      <label htmlFor="theme-selector" className="text-lg font-sans text-foreground mb-2 sm:mb-0">
        **Interface Theme**
      </label>
      
      <div className="w-full sm:w-48">
        <StyledSelect 
          id="theme-selector"
          value={theme}
          onChange={handleThemeChange}
        >
          <option value="light">Light Mode (Ethereal)</option>
          <option value="dark">Dark Mode (Deep Chroma)</option>
          <option value="system">System Default</option>
        </StyledSelect>
      </div>
    </div>
  );
}
