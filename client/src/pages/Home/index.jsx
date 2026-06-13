import SiteHeader from './SiteHeader'
import HeroSection from './HeroSection'
import SubHeroTiles from './SubHeroTiles'
import MythBreaker from './MythBreaker'
import TestimonialsCarousel from './TestimonialsCarousel'
import FounderPhilosophy from './FounderPhilosophy'
import Footer from './Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg">
      <SiteHeader />
      <main>
        <HeroSection />
        <SubHeroTiles />
        <MythBreaker />
        <TestimonialsCarousel />
        <FounderPhilosophy />
      </main>
      <Footer />
    </div>
  )
}
