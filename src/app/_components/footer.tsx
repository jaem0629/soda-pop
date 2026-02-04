interface FooterProps {
  privacyPolicyUrl: string
  termsOfServiceUrl: string
  contactUrl: string
}

export function Footer({
  privacyPolicyUrl,
  termsOfServiceUrl,
  contactUrl,
}: FooterProps) {
  return (
    <div className='flex w-full items-center justify-between text-xs'>
      <p>© 2026 Soda Pop</p>
      <div className='flex gap-4'>
        <a href={privacyPolicyUrl} className='transition-colors'>
          Privacy
        </a>
        <a href={termsOfServiceUrl} className='transition-colors'>
          Terms
        </a>
        <a href={contactUrl} className='transition-colors'>
          Contact
        </a>
      </div>
    </div>
  )
}
