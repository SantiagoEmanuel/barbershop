import type { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export default function Button({ children, className, ...props }: Props) {
  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
