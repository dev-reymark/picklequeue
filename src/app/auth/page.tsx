import { redirect } from 'next/navigation';

export default function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  redirect('/login');
}
