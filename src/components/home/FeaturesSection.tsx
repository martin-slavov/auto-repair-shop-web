import { ClipboardCheck, ReceiptText, Wrench } from 'lucide-react'

const features = [
  {
    icon: ReceiptText,
    title: 'Transparent pricing',
    text: 'See base prices and estimated hours for every service before you book.',
  },
  {
    icon: Wrench,
    title: 'Experienced mechanics',
    text: 'Your car is handled by mechanics who work on it from inspection to completion.',
  },
  {
    icon: ClipboardCheck,
    title: 'Follow your repair online',
    text: 'Log in to see the status of your service requests and visits.',
  },
]

function FeaturesSection() {
  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2>Why choose us</h2>

        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex flex-col gap-3">
              <div className="flex size-12 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-6" aria-hidden="true" />
              </div>
              <h3 className="text-xl">{title}</h3>
              <p className="text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
