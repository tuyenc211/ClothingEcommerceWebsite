export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className=" w-full space-y-8 p-4">{children}</div>
    </div>
  );
}
