import CallToAction from '@/components/home/CallToAction'
import FeaturesSection from '@/components/home/FeaturesSection'
import HeroSection from '@/components/home/HeroSection'
import ServicesPreview from '@/components/home/ServicesPreview'

function HomePage() {
  return (
    <>
      <HeroSection />
      <ServicesPreview />
      <FeaturesSection />
      <CallToAction />
    </>
  )
}

export default HomePage
