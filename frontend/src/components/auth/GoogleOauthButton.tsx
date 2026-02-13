import Logo from "./GoogleLogo"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GoogleOAuthFailure = () => {
  const router = useRouter();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Logo label="Login" />
          Team Sync.
        </Link>
        <div className="flex flex-col gap-6"></div>
      </div>
      <Card>
        <CardContent>
          <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Authentication Failed</h1>
            <p>We couldn't sign you in with Google. Please try again.</p>

            <Button onClick={() => router.push("/")} style={{ marginTop: "20px" }}>
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleOAuthFailure;