import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatusCardProps {
  icon: string | ReactNode;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string; // Allow additional styling if needed
}

export function StatusCard({
  icon,
  title,
  description,
  children,
  className,
}: StatusCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6 space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl">{icon}</div>
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}
