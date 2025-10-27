/**
 * Admin Data Page
 * Redirects to overview by default
 */

import { redirect } from 'next/navigation';

export default function AdminDataPage() {
  redirect('/admin/data/overview');
}
