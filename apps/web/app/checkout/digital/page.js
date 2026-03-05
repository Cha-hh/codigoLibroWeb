import { redirect } from 'next/navigation'

export default function DigitalCheckoutDisabled() {
  redirect('/checkout')
}
