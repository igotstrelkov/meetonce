import { ReactNode } from "react";

interface StepWrapperProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function StepWrapper({ title, description, children }: StepWrapperProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
      {children}
    </div>
  );
}
