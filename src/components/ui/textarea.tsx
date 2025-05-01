
import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  appendText?: string;
  onAppendText?: (text: string) => void;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, appendText, onAppendText, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    
    // Effect to append text when appendText prop changes
    React.useEffect(() => {
      if (appendText && textareaRef.current) {
        const textarea = textareaRef.current;
        const currentValue = textarea.value;
        
        // Check if the text already exists to avoid duplication
        if (!currentValue.includes(appendText)) {
          // Add a separator if there's already content
          const newValue = currentValue ? `${currentValue}\n• ${appendText}` : `• ${appendText}`;
          
          // Set the new value and trigger change event
          textarea.value = newValue;
          
          // Notify parent component about appended text
          if (onAppendText) {
            onAppendText(newValue);
          }
          
          // Create and dispatch change event
          const event = new Event('input', { bubbles: true });
          textarea.dispatchEvent(event);
        }
      }
    }, [appendText, onAppendText]);
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={(element) => {
          // Assign to both refs
          if (typeof ref === 'function') {
            ref(element);
          } else if (ref) {
            ref.current = element;
          }
          textareaRef.current = element;
        }}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
