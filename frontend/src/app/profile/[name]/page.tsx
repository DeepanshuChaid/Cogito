export default async function profilePage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {

  const { name } = await params;
  
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      PROFILE PAGE MF {name} 
    </div>
  );
}
