import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      toastOptions={{
        style: {
          fontFamily: '"JetBrains Mono", "Courier New", monospace',
          fontSize: 12,
          fontWeight: 'bold',
          letterSpacing: 1,
          background: '#0d1117',
          border: '1px solid #30363d',
          borderRadius: 0,
          color: '#c9d1d9',
          boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
          imageRendering: 'pixelated' as never,
          padding: '10px 16px',
        },
        classNames: {
          success: 'terminal-toast-success',
          error: 'terminal-toast-error',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
