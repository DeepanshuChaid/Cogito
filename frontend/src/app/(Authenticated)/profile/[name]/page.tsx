import ProfileClient from "./ProfileClient";

export default function Page({
  params,
}: {
  params: { name: string };
}) {
  return <ProfileClient />;
}
