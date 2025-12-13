import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="gap-0">
      <CardHeader className="flex  items-center justify-center  space-y-0 ">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
